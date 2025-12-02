import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { UserAffiliateLink, AffiliateClick, UserAffiliateStats, TeamMemberStats, TopProduct } from '../models/affiliate.model';

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {
  private supabase = inject(SupabaseService);

  // Obter links afiliados do usuário atual
  getUserAffiliateLinks(): Observable<UserAffiliateLink[]> {
    return from(
      this.supabase.client
        .from('user_affiliate_links')
        .select(`
          *,
          products:product_id (
            id,
            name,
            image,
            price
          )
        `)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(this.mapFromDb);
      })
    );
  }

  // Obter link afiliado para produto usando estratégia Round-Robin
  async getAffiliateLinkRoundRobin(productId: string): Promise<UserAffiliateLink | null> {
    // 1. Buscar todos os links ativos para este produto
    const { data: links, error: linksError } = await this.supabase.client
      .from('user_affiliate_links')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true);

    if (linksError) throw linksError;
    if (!links || links.length === 0) return null;

    // 2. Para cada link, contar quantos cliques teve
    const linksWithClickCount = await Promise.all(
      links.map(async (link: any) => {
        const { count } = await this.supabase.client
          .from('affiliate_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('user_affiliate_link_id', link.id);

        return {
          ...link,
          clickCount: count || 0
        };
      })
    );

    // 3. Ordenar por menor número de cliques e retornar o primeiro
    const sortedLinks = linksWithClickCount.sort((a, b) => a.clickCount - b.clickCount);
    return this.mapFromDb(sortedLinks[0]);
  }

  // Obter link afiliado específico do usuário para um produto
  getUserLinkForProduct(productId: string): Observable<UserAffiliateLink | null> {
    return from(
      (async () => {
        const { data: session } = await this.supabase.getSession();
        if (!session.session?.user) throw new Error('User not authenticated');

        return this.supabase.client
          .from('user_affiliate_links')
          .select('*')
          .eq('product_id', productId)
          .eq('user_id', session.session.user.id)
          .maybeSingle();
      })()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? this.mapFromDb(data) : null;
      })
    );
  }

  // Criar ou atualizar link afiliado
  async upsertAffiliateLink(productId: string, affiliateLink: string, commissionRate: number = 5.00): Promise<UserAffiliateLink> {
    const { data: session } = await this.supabase.getSession();
    if (!session.session?.user) throw new Error('User not authenticated');

    const { data, error } = await (this.supabase.client as any)
      .from('user_affiliate_links')
      .upsert({
        user_id: session.session.user.id,
        product_id: productId,
        affiliate_link: affiliateLink,
        commission_rate: commissionRate,
        is_active: true
      }, {
        onConflict: 'user_id,product_id'
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDb(data);
  }

  // Desativar link afiliado
  async deactivateLink(linkId: string): Promise<void> {
    const { error } = await (this.supabase.client as any)
      .from('user_affiliate_links')
      .update({ is_active: false })
      .eq('id', linkId);

    if (error) throw error;
  }

  // Deletar link afiliado
  async deleteLink(linkId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('user_affiliate_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;
  }

  // Registrar clique
  async trackClick(productId: string, userAffiliateLinkId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const { data: session } = await this.supabase.getSession();
    
    const { error } = await (this.supabase.client as any)
      .from('affiliate_clicks')
      .insert({
        user_affiliate_link_id: userAffiliateLinkId,
        product_id: productId,
        user_id: session.session?.user?.id,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) throw error;
  }

  // Obter estatísticas do usuário
  async getUserStats(): Promise<UserAffiliateStats> {
    const { data: session } = await this.supabase.getSession();
    if (!session.session?.user) throw new Error('User not authenticated');

    // Total de links ativos
    const { count: activeLinks } = await this.supabase.client
      .from('user_affiliate_links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.session.user.id)
      .eq('is_active', true);

    // Obter todos os cliques do usuário
    const { data: links } = await this.supabase.client
      .from('user_affiliate_links')
      .select('id')
      .eq('user_id', session.session.user.id);

    if (!links || links.length === 0) {
      return {
        totalClicks: 0,
        totalConversions: 0,
        totalCommission: 0,
        conversionRate: 0,
        activeLinks: activeLinks || 0
      };
    }

    const linkIds = links.map((l: any) => l.id);

    const { data: clicks } = await this.supabase.client
      .from('affiliate_clicks')
      .select('*')
      .in('user_affiliate_link_id', linkIds);

    const totalClicks = clicks?.length || 0;
    const conversions = clicks?.filter((c: any) => c.converted) || [];
    const totalConversions = conversions.length;
    const totalCommission = conversions.reduce((sum: number, c: any) => sum + (c.commission_earned || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      totalClicks,
      totalConversions,
      totalCommission,
      conversionRate,
      activeLinks: activeLinks || 0
    };
  }

  // Obter cliques recentes
  getRecentClicks(limit: number = 10): Observable<AffiliateClick[]> {
    return from(
      this.supabase.client
        .from('affiliate_clicks')
        .select(`
          *,
          user_affiliate_links!inner(user_id),
          products:product_id (name, image)
        `)
        .order('clicked_at', { ascending: false })
        .limit(limit)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(this.mapClickFromDb);
      })
    );
  }

  private mapFromDb(data: any): UserAffiliateLink {
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      affiliateLink: data.affiliate_link,
      commissionRate: data.commission_rate,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapClickFromDb(data: any): AffiliateClick {
    return {
      id: data.id,
      userAffiliateLinkId: data.user_affiliate_link_id,
      userId: data.user_id,
      productId: data.product_id,
      clickedAt: data.clicked_at,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      converted: data.converted,
      conversionValue: data.conversion_value,
      commissionEarned: data.commission_earned,
      convertedAt: data.converted_at
    };
  }

  // Obter estatísticas de todos os usuários (Team Stats)
  async getTeamStats(): Promise<TeamMemberStats[]> {
    const { data, error } = await this.supabase.client
      .from('team_stats')
      .select('*')
      .order('total_clicks', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      userId: row.user_id,
      email: row.email,
      displayName: row.display_name || row.email.split('@')[0],
      totalProductsWithLinks: row.total_products_with_links || 0,
      totalClicks: row.total_clicks || 0,
      totalCommission: Number(row.total_commission) || 0,
      totalConversions: row.total_conversions || 0
    }));
  }

  // Obter top 10 produtos mais clicados
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const { data, error } = await this.supabase.client
      .from('affiliate_clicks')
      .select(`
        product_id,
        products:product_id (name, image),
        user_affiliate_links!inner (
          user_id,
          users:user_id (
            email,
            raw_user_meta_data
          )
        )
      `);

    if (error) throw error;

    // Agrupar por produto e contar cliques
    const productMap = new Map<string, any>();
    
    (data || []).forEach((click: any) => {
      const productId = click.product_id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: click.products?.name || 'Produto',
          productImage: click.products?.image || '',
          totalClicks: 0,
          createdBy: click.user_affiliate_links?.user_id || '',
          createdByName: click.user_affiliate_links?.users?.raw_user_meta_data?.display_name || 
                       click.user_affiliate_links?.users?.email?.split('@')[0] || 'Desconhecido'
        });
      }
      const product = productMap.get(productId);
      product.totalClicks++;
    });

    // Converter para array e ordenar
    return Array.from(productMap.values())
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, limit);
  }
}
