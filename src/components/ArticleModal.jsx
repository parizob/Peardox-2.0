import React, { useState, useEffect } from 'react';
import { X, Heart, ExternalLink, Calendar, Users, Tag, Share2, Brain, Sparkles, BookOpen, GraduationCap, User, Check, MessageCircle, Send, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { arxivAPI, commentsAPI } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

const ArticleModal = ({ article, isOpen, onClose, isFavorite, onToggleFavorite }) => {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [fullAbstract, setFullAbstract] = useState(null);
  const [isLoadingAbstract, setIsLoadingAbstract] = useState(false);
  
  // Comment system state
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentErrors, setCommentErrors] = useState({});
  
  // Get user context
  const { user, userProfile } = useUser();
  
  // Lazy load full abstract when modal opens (only if not already loaded)
  useEffect(() => {
    if (isOpen && article && !fullAbstract && !article.originalAbstract) {
      setIsLoadingAbstract(true);
      arxivAPI.getPaperDetails(article.id)
        .then(details => {
          setFullAbstract(details.abstract);
        })
        .catch(error => {
          console.error('Failed to load paper details:', error);
        })
        .finally(() => {
          setIsLoadingAbstract(false);
        });
    }
  }, [isOpen, article, fullAbstract]);

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && article) {
      loadComments();
      loadCommentCount();
    }
  }, [isOpen, article]);

  // Comment functions
  const loadComments = async () => {
    if (!article) return;
    
    setIsLoadingComments(true);
    try {
      const articleComments = await commentsAPI.getArticleComments(article.id);
      setComments(articleComments);
      setCommentErrors({});
    } catch (error) {
      console.error('Failed to load comments:', error);
      setCommentErrors({ load: 'Failed to load comments. Please try again.' });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadCommentCount = async () => {
    if (!article) return;
    
    try {
      const count = await commentsAPI.getArticleCommentCount(article.id);
      setCommentCount(count);
    } catch (error) {
      console.error('Failed to load comment count:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setCommentErrors({ submit: 'You must be logged in to post comments.' });
      return;
    }

    if (!newComment.trim()) {
      setCommentErrors({ submit: 'Comment cannot be empty.' });
      return;
    }

    if (newComment.length > 2000) {
      setCommentErrors({ submit: 'Comment cannot exceed 2000 characters.' });
      return;
    }

    setIsSubmittingComment(true);
    setCommentErrors({});

    try {
      await commentsAPI.addComment(article.id, user.id, newComment);
      setNewComment('');
      await loadComments(); // Reload comments to show the new one
      await loadCommentCount(); // Update comment count
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setCommentErrors({ submit: error.message || 'Failed to post comment. Please try again.' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment_text);
    setCommentErrors({});
  };

  const handleSaveEdit = async (commentId) => {
    if (!user) return;

    if (!editingCommentText.trim()) {
      setCommentErrors({ [commentId]: 'Comment cannot be empty.' });
      return;
    }

    if (editingCommentText.length > 2000) {
      setCommentErrors({ [commentId]: 'Comment cannot exceed 2000 characters.' });
      return;
    }

    try {
      await commentsAPI.updateComment(commentId, user.id, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentErrors({});
      await loadComments(); // Reload comments to show the updated one
    } catch (error) {
      console.error('Failed to update comment:', error);
      setCommentErrors({ [commentId]: error.message || 'Failed to update comment. Please try again.' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentErrors({});
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.deleteComment(commentId, user.id);
      await loadComments(); // Reload comments to remove the deleted one
      await loadCommentCount(); // Update comment count
      setCommentErrors({});
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setCommentErrors({ [commentId]: error.message || 'Failed to delete comment. Please try again.' });
    }
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  if (!isOpen || !article) return null;

  // Generate slug from paper title and arxiv ID for URL generation
  const generateSlug = (title, arxivId) => {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    // Limit length for better URLs
    const truncatedTitle = cleanTitle.length > 60 ? cleanTitle.substring(0, 60).replace(/-[^-]*$/, '') : cleanTitle;
    
    return `${arxivId}-${truncatedTitle}`;
  };

  const handleShare = async () => {
    const slug = generateSlug(article.title, article.arxivId);
    const shareUrl = `${window.location.origin}/article/${slug}`;
    const shareData = {
      title: `${article.title} | Pearadox`,
      text: `Check out this research: ${article.shortDescription}`,
      url: shareUrl
    };

    try {
      // Try native sharing first (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard with custom popup
        await navigator.clipboard.writeText(shareUrl);
        
        // Show custom popup
        setShowCopiedPopup(true);
        setTimeout(() => {
          setShowCopiedPopup(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show custom popup for fallback too
        setShowCopiedPopup(true);
        setTimeout(() => {
          setShowCopiedPopup(false);
        }, 2000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        // Final fallback: show URL in prompt
        prompt('Copy this link to share:', shareUrl);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Artificial Intelligence': 'bg-blue-100 text-blue-800',
      'Quantum Computing': 'bg-purple-100 text-purple-800',
      'Edge Computing': 'bg-green-100 text-green-800',
      'Computer Vision': 'bg-orange-100 text-orange-800',
      'Natural Language Processing': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getSkillLevelColor = (skillLevel) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800 border-green-200',
      'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Advanced': 'bg-orange-100 text-orange-800 border-orange-200',
      'Expert': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[skillLevel] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-full mx-2 sm:mx-4">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-start">
            <div className="flex-1 pr-3 sm:pr-4 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">{article.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {article.skillLevel && (
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getSkillLevelColor(article.skillLevel)}`}>
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {article.skillLevel}
                  </span>
                )}
                {article.hasSummary && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    AI Summary
                  </span>
                )}
                {isFavorite && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current" />
                    Favorite
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={() => onToggleFavorite(article.id)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 ${
                    isFavorite ? 'fill-current' : ''
                  }`} 
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Overview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
                <h3 className="text-base sm:text-lg font-semibold text-blue-900">Overview</h3>
              </div>
              <p className="text-blue-800 leading-relaxed text-sm sm:text-base">{article.shortDescription}</p>
            </div>

            {/* AI-Generated Summary Section (if available) */}
            {article.summaryContent && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center mb-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-purple-900">AI-Generated Summary</h3>
                </div>
                <div className="text-purple-800 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                  {article.summaryContent}
                </div>
              </div>
            )}

            {/* Technical Details Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Technical Details</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                <strong>Original Research Title:</strong><br /><br />
                {article.originalTitle}<br /><br />
                <strong>Research Abstract:</strong><br /><br />
                {isLoadingAbstract ? (
                  <span className="text-gray-600 italic">Loading full abstract...</span>
                ) : (
                  fullAbstract || article.originalAbstract || article.shortDescription
                )}
              </p>
            </div>

            {/* Article Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start text-gray-600">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-medium text-sm sm:text-base">Authors:</span>
                    <p className="text-gray-800 text-sm sm:text-base break-words">{article.authors}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-sm sm:text-base">Published:</span>
                    <p className="text-gray-800 text-sm sm:text-base">{article.publishedDate}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-sm sm:text-base">ArXiv ID:</span>
                    <p className="text-gray-800 text-sm sm:text-base break-all">{article.arxivId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Research Tags:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {article.categories && article.categories.length > 0 ? (
                    (() => {
                      // Filter out categories that contain periods or commas
                      const filteredCategories = article.categories.filter(category => !category.includes('.') && !category.includes(','));
                      
                      return filteredCategories.length > 0 ? (
                        <>
                          {filteredCategories.map((category, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium"
                            >
                              {category}
                            </span>
                          ))}
                        </>
                      ) : (
                        // Fallback to article.category if no valid categories remain
                        <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                          {article.category}
                        </span>
                      );
                    })()
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                      {article.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Read Full Research Paper
                </a>
                
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base border border-gray-300"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Share Article
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-6 sm:pt-8 border-t border-gray-200 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                  Discussion
                  {commentCount > 0 && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {commentCount}
                    </span>
                  )}
                </h3>
              </div>

              {/* Comment Form - Only for authenticated users */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex flex-col space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this research..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      rows="3"
                      maxLength={2000}
                      disabled={isSubmittingComment}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {newComment.length}/2000 characters
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {commentErrors.submit && (
                    <p className="text-red-600 text-sm mt-2">{commentErrors.submit}</p>
                  )}
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    <User className="h-4 w-4 inline mr-1" />
                    Please sign in to join the discussion and share your thoughts about this research.
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading comments...</span>
                  </div>
                ) : commentErrors.load ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 text-sm">{commentErrors.load}</p>
                    <button
                      onClick={loadComments}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.user_name}
                            </span>
                            {comment.user_title && (
                              <span className="text-gray-500 text-xs ml-1">
                                • {comment.user_title}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatCommentDate(comment.created_at)}
                            {comment.is_edited && (
                              <span className="ml-1 italic">(edited)</span>
                            )}
                          </span>
                          {user && user.id === comment.user_id && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit comment"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete comment"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            rows="3"
                            maxLength={2000}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {editingCommentText.length}/2000 characters
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(comment.id)}
                                disabled={!editingCommentText.trim()}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                          {commentErrors[comment.id] && (
                            <p className="text-red-600 text-xs">{commentErrors[comment.id]}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom "Link Copied" Popup */}
      {showCopiedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-[60]">
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
    </>
  );
};

export default ArticleModal; 