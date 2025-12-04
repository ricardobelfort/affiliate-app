import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'afiliados' | 'produtos' | 'contato' | 'geral';
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.html',
  styleUrls: ['./faq.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FAQPage {
  expandedItems = signal<Set<string>>(new Set());

  faqItems: FAQItem[] = [
    {
      id: 'afiliados-1',
      question: 'Como funciona o programa de afiliados?',
      answer: 'Nosso programa de afiliados permite que você ganhe comissão por cada venda realizada através do seu link exclusivo. Você recebe um link único que rastreia as vendas geradas por você. Cadastre-se na seção de administração para começar a ganhar.',
      category: 'afiliados'
    },
    {
      id: 'afiliados-2',
      question: 'Qual é o percentual de comissão?',
      answer: 'O percentual de comissão varia conforme o produto e a categoria. Em geral, oferecemos entre 5% a 15% de comissão por venda. Para detalhes específicos, acesse sua conta de afiliado.',
      category: 'afiliados'
    },
    {
      id: 'afiliados-3',
      question: 'Quando recebo meu pagamento?',
      answer: 'Os pagamentos são processados mensalmente, no primeiro dia útil do mês seguinte. Você pode acompanhar seus ganhos em tempo real no painel de afiliados.',
      category: 'afiliados'
    },
    {
      id: 'produtos-1',
      question: 'Como é garantida a qualidade dos produtos?',
      answer: 'Todos os produtos em nossa plataforma são cuidadosamente selecionados. Trabalhamos apenas com marcas confiáveis e vendedores verificados. Cada produto tem avaliações de clientes reais.',
      category: 'produtos'
    },
    {
      id: 'produtos-2',
      question: 'Os preços são os menores do mercado?',
      answer: 'Comparamos constantemente os preços com outras plataformas. Nosso objetivo é oferecer as melhores ofertas. Se encontrar um preço menor em outro lugar, nos avise que tentaremos igualar.',
      category: 'produtos'
    },
    {
      id: 'contato-1',
      question: 'Quanto tempo leva para responder minhas dúvidas?',
      answer: 'Respondemos a todas as mensagens em até 24 horas durante os dias úteis. Fins de semana podem levar mais tempo. Você receberá uma resposta através do email cadastrado.',
      category: 'contato'
    },
    {
      id: 'contato-2',
      question: 'Posso anunciar meus produtos na plataforma?',
      answer: 'Sim! Temos opções de parceria e publicidade. Entre em contato conosco através do formulário de contato ou envie um email para parcerias@centralbompreco.com.br.',
      category: 'contato'
    },
    {
      id: 'geral-1',
      question: 'Quais são os horários de atendimento?',
      answer: 'Atendemos de segunda a sexta, de 9h às 18h, e sábado de 9h às 13h. Domingos não temos atendimento. Você pode enviar mensagens a qualquer hora que responderemos assim que possível.',
      category: 'geral'
    },
    {
      id: 'geral-2',
      question: 'A plataforma é segura?',
      answer: 'Sim! Usamos encriptação SSL, política de segurança robusta e estamos em conformidade com as melhores práticas de proteção de dados. Seus dados pessoais e financeiros estão sempre protegidos.',
      category: 'geral'
    }
  ];

  categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'afiliados', label: 'Afiliados' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'contato', label: 'Contato' },
    { id: 'geral', label: 'Geral' }
  ];

  selectedCategory = signal<string>('todos');

  get filteredFAQ() {
    const category = this.selectedCategory();
    if (category === 'todos') {
      return this.faqItems;
    }
    return this.faqItems.filter(item => item.category === category);
  }

  toggleItem(itemId: string) {
    this.expandedItems.update(items => {
      const newSet = new Set(items);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
  }

  getCategoryLabel(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.label || '';
  }
}
