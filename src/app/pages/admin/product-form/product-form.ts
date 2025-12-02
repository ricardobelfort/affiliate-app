import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { AmazonService } from '../../../services/amazon.service';
import { AIService } from '../../../services/ai.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { Category } from '../../../models/product.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class AdminProductFormPage implements OnInit {
  private productService = inject(ProductService);
  private amazonService = inject(AmazonService);
  private aiService = inject(AIService);
  private affiliateService = inject(AffiliateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = signal(false);
  saving = signal(false);
  categories = signal<Category[]>([]);
  productId: string | null = null;
  isEditMode = false;
  showSuccessMessage = signal(false);
  successMessage = signal('');
  
  amazonUrl = signal('');
  importing = signal(false);
  importError = signal('');
  
  generatingShortDesc = signal(false);
  generatingFullDesc = signal(false);
  shortDescLength = signal(0);
  fullDescLength = signal(0);

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      shortDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(160)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(0)]],
      oldPrice: [''],
      category: ['', Validators.required],
      storeType: ['', Validators.required],
      asin: ['', [Validators.pattern(/^[A-Z0-9]{10}$/)]],
      image: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      affiliateLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });

    // Atualizar contadores quando o valor mudar
    this.form.get('shortDescription')?.valueChanges.subscribe(value => {
      this.shortDescLength.set(value?.length || 0);
    });
    
    this.form.get('description')?.valueChanges.subscribe(value => {
      this.fullDescLength.set(value?.length || 0);
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.form.patchValue({
            name: product.name,
            shortDescription: product.shortDescription,
            description: product.description,
            price: product.price,
            oldPrice: product.oldPrice || '',
            category: product.category,
            storeType: product.storeType || 'outros',
            asin: product.asin || '',
            image: product.image,
            affiliateLink: product.affiliateLink
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading.set(false);
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    
    try {
      const formValue = this.form.value;
      const affiliateLink = formValue.affiliateLink;
      
      // Preparar dados do produto - affiliate_link não é mais usado mas precisa de valor vazio
      const productData = { 
        ...formValue,
        affiliateLink: '' // Coluna legacy, agora usa user_affiliate_links
      };
      
      let productId: string;
      
      if (this.isEditMode && this.productId) {
        await this.productService.updateProduct(this.productId, productData);
        productId = this.productId;
        this.successMessage.set('Produto atualizado com sucesso!');
      } else {
        const newProduct = await this.productService.addProduct(productData);
        productId = newProduct.id;
        this.successMessage.set('Produto criado com sucesso!');
      }
      
      // Salvar o link de afiliado como link do usuário atual
      if (affiliateLink) {
        await this.affiliateService.upsertAffiliateLink(productId, affiliateLink, 5.0);
      }

      this.showSuccessMessage.set(true);
      setTimeout(() => {
        this.showSuccessMessage.set(false);
        this.router.navigate(['/admin/products']);
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      const action = this.isEditMode ? 'atualizar' : 'criar';
      this.successMessage.set(`Erro ao ${action} produto. Tente novamente.`);
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) return 'Campo obrigatório';
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo de ${maxLength} caracteres`;
    }
    if (control?.hasError('min')) return 'Valor deve ser maior que zero';
    if (control?.hasError('pattern')) return 'URL inválida';
    return '';
  }

  async importFromAmazon() {
    const url = this.amazonUrl();
    if (!url) {
      this.importError.set('Por favor, insira uma URL da Amazon');
      return;
    }

    this.importing.set(true);
    this.importError.set('');

    try {
      const asin = this.amazonService.extractASIN(url);
      if (!asin) {
        this.importError.set('Não foi possível extrair o ASIN desta URL. Verifique se o link é válido.');
        this.importing.set(false);
        return;
      }

      const productData = await this.amazonService.getProductData(asin);
      
      if (!productData) {
        this.importError.set('⚠️ Sua conta Amazon Associates precisa ser aprovada para usar a PA-API. Enquanto isso, você pode preencher os campos manualmente. Acesse: https://affiliate-program.amazon.com → Ferramentas → Product Advertising API');
        this.importing.set(false);
        return;
      }

      // Auto-preencher o formulário com os dados importados
      this.form.patchValue({
        name: productData.title || '',
        price: productData.price || '',
        image: productData.imageUrl || '',
        affiliateLink: url,
        storeType: 'amazon',
        asin: asin,
        shortDescription: productData.title?.substring(0, 100) || '',
        description: productData.features?.join('\n• ') || productData.title || ''
      });

      this.successMessage.set('Produto importado com sucesso! Ajuste os campos conforme necessário.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 3000);

    } catch (error) {
      console.error('Error importing from Amazon:', error);
      this.importError.set('Erro ao importar produto. Tente novamente.');
    } finally {
      this.importing.set(false);
    }
  }

  async generateShortDescription() {
    const productName = this.form.get('name')?.value;
    if (!productName) {
      this.importError.set('Preencha o nome do produto primeiro');
      setTimeout(() => this.importError.set(''), 3000);
      return;
    }

    this.generatingShortDesc.set(true);
    this.importError.set('');

    try {
      const shortDesc = await this.aiService.generateShortDescription(productName);
      
      this.form.patchValue({
        shortDescription: shortDesc.substring(0, 160)
      });

      this.successMessage.set('✨ Descrição curta gerada com IA! Ajuste se necessário.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 2500);
    } catch (error) {
      console.error('Error generating description:', error);
      this.importError.set('Erro ao gerar descrição com IA. Tente novamente.');
      setTimeout(() => this.importError.set(''), 3000);
    } finally {
      this.generatingShortDesc.set(false);
    }
  }

  async generateFullDescription() {
    const productName = this.form.get('name')?.value;
    const shortDesc = this.form.get('shortDescription')?.value;
    
    if (!productName) {
      this.importError.set('Preencha o nome do produto primeiro');
      setTimeout(() => this.importError.set(''), 3000);
      return;
    }

    this.generatingFullDesc.set(true);
    this.importError.set('');

    try {
      const fullDesc = await this.aiService.generateFullDescription(productName, shortDesc);
      
      this.form.patchValue({
        description: fullDesc.substring(0, 1000)
      });

      this.successMessage.set('✨ Descrição completa gerada com IA! Ajuste se necessário.');
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 2500);
    } catch (error) {
      console.error('Error generating description:', error);
      this.importError.set('Erro ao gerar descrição com IA. Tente novamente.');
      setTimeout(() => this.importError.set(''), 3000);
    } finally {
      this.generatingFullDesc.set(false);
    }
  }
}
