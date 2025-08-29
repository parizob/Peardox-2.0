import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User, BookOpen, Tag, Eye, Share2, Heart, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { arxivAPI } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Generate slug from paper title and arxiv ID
function generateSlug(title, arxivId) {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphons with single
    .trim();
  
  return `${arxivId}-${cleanTitle}`;
}

// Extract arxiv ID from slug
function extractArxivId(slug) {
  const match = slug.match(/^(\d{4}\.\d{4,5})/);
  return match ? match[1] : null;
}

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        
        // Extract arxiv ID from the slug
        const arxivId = extractArxivId(id);
        
        if (!arxivId) {
          setError('Invalid article ID');
          setLoading(false);
          return;
        }

        // Get all articles to find the specific one
        const allArticles = await arxivAPI.getAllPapersWithSummaries('Beginner');
        const foundArticle = allArticles.find(a => a.arxiv_id === arxivId);

        if (!foundArticle) {
          setError('Article not found');
          setLoading(false);
          return;
        }

        // Transform the article data to match the expected format
        const transformedArticle = {
          id: foundArticle.id,
          arxiv_id: foundArticle.arxiv_id,
          title: foundArticle.summaryTitle || foundArticle.title,
          shortDescription: foundArticle.summaryOverview || foundArticle.abstract?.substring(0, 200) + '...',
          fullDescription: foundArticle.summaryContent || foundArticle.abstract,
          publishedDate: new Date(foundArticle.published_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          authors: foundArticle.authors,
          category: foundArticle.categories_name,
          url: foundArticle.pdf_url || `https://arxiv.org/pdf/${foundArticle.arxiv_id}`,
          abstract_url: foundArticle.abstract_url || `https://arxiv.org/abs/${foundArticle.arxiv_id}`,
          abstract: foundArticle.abstract,
          published_date: foundArticle.published_date
        };

        setArticle(transformedArticle);

        // Get related articles from the same category
        const related = allArticles
          .filter(a => 
            a.arxiv_id !== arxivId && 
            a.categories_name === foundArticle.categories_name
          )
          .slice(0, 4)
          .map(a => ({
            id: a.id,
            arxiv_id: a.arxiv_id,
            title: a.summaryTitle || a.title,
            shortDescription: a.summaryOverview || a.abstract?.substring(0, 150) + '...',
            authors: a.authors,
            category: a.categories_name,
            publishedDate: new Date(a.published_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }));

        setRelatedArticles(related);
        setLoading(false);
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
        setLoading(false);
      }
    };

    if (id) {
      loadArticle();
    }
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${article.title} | Pearadox`,
      text: `Check out this research: ${article.shortDescription}`,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        prompt('Copy this link to share:', shareUrl);
      }
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Artificial Intelligence': 'from-blue-500 to-cyan-400',
      'Quantum Computing': 'from-purple-500 to-pink-400',
      'Edge Computing': 'from-green-500 to-emerald-400',
      'Computer Vision': 'from-orange-500 to-yellow-400',
      'Natural Language Processing': 'from-indigo-500 to-purple-400',
      'Machine Learning': 'from-teal-500 to-green-400',
      'Information Retrieval': 'from-pink-500 to-rose-400',
      'Computation and Language': 'from-indigo-500 to-blue-400',
      'Computers and Society': 'from-gray-600 to-gray-500',
    };
    
    return colors[category] || 'from-blue-500 to-cyan-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The research article you're looking for doesn't exist or has been moved.</p>
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research Hub
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}/article/${generateSlug(article.title, article.arxiv_id)}`;

  return (
    <>
      <Helmet>
        <title>{article.title} | Pearadox Research</title>
        <meta name="description" content={article.shortDescription} />
        <meta name="keywords" content={`${article.category}, AI research, machine learning, arxiv, ${article.authors}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.shortDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Pearadox" />
        <meta property="article:published_time" content={article.published_date} />
        <meta property="article:author" content={article.authors} />
        <meta property="article:section" content={article.category} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.shortDescription} />
        
        {/* Academic citation metadata */}
        <meta name="citation_title" content={article.title} />
        <meta name="citation_author" content={article.authors} />
        <meta name="citation_publication_date" content={article.published_date} />
        <meta name="citation_arxiv_id" content={article.arxiv_id} />
        <meta name="citation_pdf_url" content={article.url} />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ScholarlyArticle",
            "headline": article.title,
            "description": article.shortDescription,
            "author": article.authors ? article.authors.split(', ').map(author => ({
              "@type": "Person",
              "name": author.trim()
            })) : [],
            "datePublished": article.published_date,
            "publisher": {
              "@type": "Organization",
              "name": "arXiv"
            },
            "url": canonicalUrl,
            "identifier": article.arxiv_id,
            "keywords": [article.category],
            "isAccessibleForFree": true,
            "license": "https://creativecommons.org/licenses/by/4.0/"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        
        {/* Back Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Research Hub
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Article Header */}
          <article className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Research Paper
                </span>
                {article.category && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(article.category)} text-white`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {article.category}
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  arXiv:{article.arxiv_id}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-6">
                {article.title}
              </h1>

              {/* Authors and Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm">{article.authors}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">{article.publishedDate}</span>
                </div>
              </div>

              {/* Summary/Overview */}
              {article.shortDescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <h2 className="text-lg font-semibold text-blue-900 mb-3">Plain English Summary</h2>
                  <p className="text-blue-800 leading-relaxed">{article.shortDescription}</p>
                </div>
              )}

              {/* Full Description/Abstract */}
              {article.fullDescription && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
                  <div className="prose prose-gray max-w-none">
                    {article.fullDescription.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Abstract */}
              {article.abstract && article.abstract !== article.fullDescription && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
                  <p className="text-gray-700 leading-relaxed">{article.abstract}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Paper (PDF)
                </a>
                
                {article.abstract_url && (
                  <a
                    href={article.abstract_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View on arXiv
                  </a>
                )}
                
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-medium ${
                    isFavorite 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Research</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    to={`/article/${generateSlug(relatedArticle.title, relatedArticle.arxiv_id)}`}
                    className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {relatedArticle.shortDescription}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{relatedArticle.authors?.split(', ')[0]} et al.</span>
                      <span>arXiv:{relatedArticle.arxiv_id}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />

        {/* Copy Success Popup */}
        {showCopiedPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 transform animate-pulse">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Link Copied!</h3>
                <p className="text-sm text-gray-600">The article link has been copied to your clipboard and is ready to share.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticlePage;
