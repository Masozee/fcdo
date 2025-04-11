from django.db import models
from django_countries.fields import CountryField
from django.utils.text import slugify
from django_countries import countries

# Create your models here.
class InternationalCooperation(models.Model):
    """
    Model representing international cooperation frameworks like ASEAN, RCEP, EU, etc.
    This allows grouping countries by their membership in international organizations.
    """
    name = models.CharField(max_length=100, help_text="Full name of the cooperation framework (e.g. 'Association of Southeast Asian Nations')")
    abbreviation = models.CharField(max_length=20, help_text="Abbreviation or short name (e.g. 'ASEAN')")
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True, help_text="Description of the cooperation framework")
    website = models.URLField(blank=True, null=True, help_text="Official website URL")
    established_date = models.DateField(blank=True, null=True, help_text="Date when the cooperation was established")
    # Store country codes as a comma-separated list in a text field
    countries = CountryField(multiple=True, blank=True, help_text="Member countries")
    is_active = models.BooleanField(default=True, help_text="Whether this cooperation is currently active")
    logo = models.ImageField(upload_to='cooperation_logos/', blank=True, null=True, help_text="Logo of the cooperation")
    keterangan = models.TextField(blank=True, null=True, help_text="Additional notes")

    class Meta:
        verbose_name = 'International Cooperation'
        verbose_name_plural = 'International Cooperations'
        ordering = ['name']

    def __str__(self):
        return f"{self.abbreviation} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.abbreviation or self.name)
        super().save(*args, **kwargs)

class Category(models.Model):
    name = models.CharField(max_length=100)
    keterangan = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Option(models.Model):
    name = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    parents = models.ManyToManyField("self", blank=True)
    keterangan = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.id:
            # Set order based on existing options in the same category
            last_option = Option.objects.filter(category=self.category).order_by('-order').first()
            if last_option:
                self.order = last_option.order + 1
            else:
                self.order = 1

        if not self.slug:
            # Generate a slug from the name
            self.slug = slugify(self.name)
            
            # Ensure slug uniqueness
            original_slug = self.slug
            counter = 1
            while Option.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
                
        super().save(*args, **kwargs)

class TradeInvestmentData(models.Model):
    country = CountryField()
    industry = models.ForeignKey(Option, on_delete=models.CASCADE)
    year = models.DateField(blank=True, null=True)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    keterangan = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{self.country.name} - {self.industry.name}'

class ProductCode(models.Model):
    code = models.CharField(max_length=10, unique=True, help_text="Product code from HS classification")
    name = models.CharField(max_length=500, help_text="Product description/nomenclature")
    hs_level = models.IntegerField(choices=[(2, 'HS2'), (4, 'HS4'), (6, 'HS6')], help_text="HS classification level")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product Code"
        verbose_name_plural = "Product Codes"
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

class HSTradeData(models.Model):
    country = CountryField(db_index=True)
    category = models.ForeignKey(ProductCode, on_delete=models.CASCADE, related_name="trade_data", help_text="Product code from HS classification", db_index=True)
    tradeflow = models.ForeignKey(Option, on_delete=models.CASCADE, related_name="HSImportExport", db_index=True)
    year = models.DateField(blank=True, null=True, db_index=True)
    value = models.DecimalField(max_digits=20, decimal_places=3)
    total_trade = models.DecimalField(max_digits=20, decimal_places=3, blank=True, null=True)
    percent_trade = models.FloatField(blank=True, null=True)
    CR4 = models.FloatField(blank=True, null=True)
    rank_within_product = models.IntegerField(blank=True, null=True, db_index=True)
    rank_desc = models.IntegerField(blank=True, null=True)
    keterangan = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "HS Trade Data"
        verbose_name_plural = "HS Trade Data"
        ordering = ['-year', 'country', 'category']
        indexes = [
            models.Index(fields=['country', 'category', 'year']),
            models.Index(fields=['category', 'year']),
            models.Index(fields=['country', 'year']),
            models.Index(fields=['tradeflow', 'year']),
            models.Index(fields=['value']),
            models.Index(fields=['year', 'value']),
        ]

    def __str__(self):
        return f"{self.country} - {self.category} - {self.tradeflow} ({self.year.year if self.year else 'No year'})"
