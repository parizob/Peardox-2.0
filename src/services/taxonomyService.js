import taxonomyData from '../data/taxonomy.json';

export class TaxonomyService {
  constructor() {
    this.taxonomy = taxonomyData;
  }

  // Get all main categories
  getMainCategories() {
    return Object.entries(this.taxonomy.categories).map(([key, category]) => ({
      id: key,
      displayName: category.displayName,
      description: category.description,
      color: category.color,
      icon: category.icon,
      arxivCategories: category.arxivCategories,
      subcategories: category.subcategories
    }));
  }

  // Get category by ID
  getCategoryById(categoryId) {
    return this.taxonomy.categories[categoryId] || null;
  }

  // Map ArXiv category to our taxonomy category
  mapArxivCategoryToTaxonomy(arxivCategory) {
    for (const [key, category] of Object.entries(this.taxonomy.categories)) {
      if (category.arxivCategories.includes(arxivCategory)) {
        return {
          id: key,
          displayName: category.displayName,
          color: category.color
        };
      }
      
      // Check subcategories
      for (const subcategory of category.subcategories) {
        if (subcategory.arxivCategories.includes(arxivCategory)) {
          return {
            id: key,
            displayName: category.displayName,
            color: category.color,
            subcategory: subcategory.name
          };
        }
      }
    }
    
    // Default fallback
    return {
      id: 'artificial_intelligence',
      displayName: 'Artificial Intelligence',
      color: 'from-blue-500 to-cyan-400'
    };
  }

  // Get all ArXiv categories for a taxonomy category
  getArxivCategoriesForTaxonomy(taxonomyCategoryId) {
    const category = this.taxonomy.categories[taxonomyCategoryId];
    if (!category) return [];

    let arxivCategories = [...category.arxivCategories];
    
    // Add subcategory ArXiv categories
    category.subcategories.forEach(sub => {
      arxivCategories = [...arxivCategories, ...sub.arxivCategories];
    });

    // Remove duplicates
    return [...new Set(arxivCategories)];
  }

  // Classify paper difficulty based on title and abstract
  classifyDifficulty(title, abstract) {
    const text = `${title} ${abstract}`.toLowerCase();
    
    for (const [level, config] of Object.entries(this.taxonomy.difficulty_levels)) {
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return level;
        }
      }
    }
    
    return 'intermediate'; // Default
  }

  // Check if paper has trending topics
  hasTrendingTopics(title, abstract) {
    const text = `${title} ${abstract}`.toLowerCase();
    return this.taxonomy.tags.trending.some(tag => 
      text.includes(tag.toLowerCase())
    );
  }

  // Check if paper has emerging topics
  hasEmergingTopics(title, abstract) {
    const text = `${title} ${abstract}`.toLowerCase();
    return this.taxonomy.tags.emerging.some(tag => 
      text.includes(tag.toLowerCase())
    );
  }

  // Get application areas for a paper
  getApplicationAreas(title, abstract) {
    const text = `${title} ${abstract}`.toLowerCase();
    return this.taxonomy.tags.applications.filter(app => 
      text.includes(app.toLowerCase())
    );
  }

  // Enhanced category mapping with subcategory detection
  categorizeArticle(arxivCategory, title, abstract) {
    const baseMapping = this.mapArxivCategoryToTaxonomy(arxivCategory);
    const text = `${title} ${abstract}`.toLowerCase();
    
    // Try to find more specific subcategory match
    const category = this.taxonomy.categories[baseMapping.id];
    if (category) {
      for (const subcategory of category.subcategories) {
        const hasKeyword = subcategory.keywords.some(keyword => 
          text.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          return {
            ...baseMapping,
            subcategory: subcategory.name,
            confidence: 'high'
          };
        }
      }
    }

    return {
      ...baseMapping,
      confidence: 'medium'
    };
  }

  // Get enhanced tags for an article
  getEnhancedTags(arxivCategory, title, abstract) {
    const categorization = this.categorizeArticle(arxivCategory, title, abstract);
    const tags = [];

    // Add main category
    tags.push(categorization.displayName);

    // Add subcategory if detected
    if (categorization.subcategory) {
      tags.push(categorization.subcategory);
    }

    // Add difficulty level
    const difficulty = this.classifyDifficulty(title, abstract);
    tags.push(difficulty.charAt(0).toUpperCase() + difficulty.slice(1));

    // Add trending/emerging flags
    if (this.hasTrendingTopics(title, abstract)) {
      tags.push('Trending');
    }

    if (this.hasEmergingTopics(title, abstract)) {
      tags.push('Emerging');
    }

    // Add application areas
    const applications = this.getApplicationAreas(title, abstract);
    tags.push(...applications.map(app => 
      app.charAt(0).toUpperCase() + app.slice(1)
    ));

    return tags;
  }

  // Filter categories based on available papers
  getAvailableCategories(papers) {
    const availableCategories = new Set();
    
    papers.forEach(paper => {
      const mapping = this.mapArxivCategoryToTaxonomy(paper._original?.category || paper.category);
      availableCategories.add(mapping.id);
    });

    return this.getMainCategories().filter(category => 
      availableCategories.has(category.id)
    );
  }

  // Get papers by taxonomy category
  filterPapersByCategory(papers, taxonomyCategoryId) {
    const arxivCategories = this.getArxivCategoriesForTaxonomy(taxonomyCategoryId);
    
    return papers.filter(paper => {
      const paperCategory = paper._original?.category || paper.category;
      return arxivCategories.includes(paperCategory);
    });
  }

  // Search papers with taxonomy-aware filtering
  searchPapersWithTaxonomy(papers, searchTerm, filters = {}) {
    let filteredPapers = papers;

    // Apply category filter
    if (filters.category) {
      filteredPapers = this.filterPapersByCategory(filteredPapers, filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filteredPapers = filteredPapers.filter(paper => {
        const difficulty = this.classifyDifficulty(
          paper.originalTitle || paper.title,
          paper.originalAbstract || paper.shortDescription
        );
        return difficulty === filters.difficulty;
      });
    }

    // Apply trending filter
    if (filters.trending) {
      filteredPapers = filteredPapers.filter(paper => {
        return this.hasTrendingTopics(
          paper.originalTitle || paper.title,
          paper.originalAbstract || paper.shortDescription
        );
      });
    }

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredPapers = filteredPapers.filter(paper =>
        paper.title.toLowerCase().includes(term) ||
        paper.shortDescription.toLowerCase().includes(term) ||
        (paper.originalTitle && paper.originalTitle.toLowerCase().includes(term)) ||
        (paper.originalAbstract && paper.originalAbstract.toLowerCase().includes(term)) ||
        paper.authors.toLowerCase().includes(term)
      );
    }

    return filteredPapers;
  }
}

// Export singleton instance
export const taxonomyService = new TaxonomyService(); 