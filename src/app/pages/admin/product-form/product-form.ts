import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { AmazonService } from '../../../services/amazon.service';
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
      shortDescription: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      image: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      affiliateLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
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
            category: product.category,
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
      
      if (this.isEditMode && this.productId) {
        await this.productService.updateProduct(this.productId, formValue);
        this.successMessage.set('Produto atualizado com sucesso!');
      } else {
        await this.productService.addProduct(formValue);
        this.successMessage.set('Produto criado com sucesso!');
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
}
