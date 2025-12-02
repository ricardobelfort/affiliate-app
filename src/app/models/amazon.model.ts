export interface AmazonProductData {
  asin: string;
  title: string;
  price?: number;
  oldPrice?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  brand?: string;
  primeEligible?: boolean;
  availability?: string;
}

export interface PAAPIResponse {
  ItemsResult?: {
    Items?: Array<{
      ASIN: string;
      ItemInfo?: {
        Title?: {
          DisplayValue?: string;
        };
        Features?: {
          DisplayValues?: string[];
        };
      };
      Offers?: {
        Listings?: Array<{
          Price?: {
            Amount?: number;
            DisplayAmount?: string;
          };
        }>;
      };
      Images?: {
        Primary?: {
          Large?: {
            URL?: string;
          };
        };
      };
      CustomerReviews?: {
        StarRating?: {
          Value?: number;
        };
        Count?: number;
      };
    }>;
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}
