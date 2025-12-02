import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = signal(false);
  saving = signal(false);
  categories = signal<Category[]>([]);
  productId: string | null = null;
  isEditMode = false;

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
      } else {
        await this.productService.addProduct(formValue);
      }

      this.router.navigate(['/admin/products']);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto');
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
}
