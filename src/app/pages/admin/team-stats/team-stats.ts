import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AffiliateService } from '../../../services/affiliate.service';
import { TeamMemberStats, TopProduct } from '../../../models/affiliate.model';

@Component({
  selector: 'app-team-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-stats.html',
  styleUrl: './team-stats.css'
})
export class TeamStatsPage implements OnInit {
  private affiliateService = inject(AffiliateService);

  teamStats = signal<TeamMemberStats[]>([]);
  topProducts = signal<TopProduct[]>([]);
  loading = signal(true);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [stats, products] = await Promise.all([
        this.affiliateService.getTeamStats(),
        this.affiliateService.getTopProducts(10)
      ]);
      
      this.teamStats.set(stats);
      this.topProducts.set(products);
    } catch (error) {
      console.error('Error loading team stats:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getTotalStats() {
    const stats = this.teamStats();
    return {
      totalProducts: stats.reduce((sum, s) => sum + s.totalProductsWithLinks, 0),
      totalClicks: stats.reduce((sum, s) => sum + s.totalClicks, 0),
      totalCommission: stats.reduce((sum, s) => sum + s.totalCommission, 0),
      totalConversions: stats.reduce((sum, s) => sum + s.totalConversions, 0)
    };
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
