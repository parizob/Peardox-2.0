import React, { useState, useEffect } from 'react';
import { X, Heart, ExternalLink, Calendar, Users, Tag, Share2, Brain, Sparkles, BookOpen, GraduationCap, User, Check, MessageCircle, Send, Edit3, Trash2, MoreVertical, CheckCircle, XCircle, HelpCircle, ChevronDown, ArrowUpRight } from 'lucide-react';
import { arxivAPI, commentsAPI, quizAPI } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

const ArticleModal = ({ article, isOpen, onClose, isFavorite, onToggleFavorite, user: userProp, onOpenAccountModal }) => {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [fullAbstract, setFullAbstract] = useState(null);
  const [isLoadingAbstract, setIsLoadingAbstract] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // Comment system state
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentErrors, setCommentErrors] = useState({});
  
  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizSubmission, setQuizSubmission] = useState(null); // { answer_type: 'true'|'false' } or null if not taken
  
  // Get user context
  const { user, userProfile } = useUser();
  
  // Get theme context
  const { isDarkMode } = useTheme();
  
  // Format date to human-readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    
    // If already formatted (e.g., "December 11, 2025"), return as-is
    if (typeof dateString === 'string' && dateString.match(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateString; // Return original if parsing fails
    }
  };
  
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
      await loadComments();
      await loadCommentCount();
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
      await loadComments();
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
      await loadComments();
      await loadCommentCount();
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

  // Get quiz data from article or use placeholder
  const getQuizData = () => {
    if (article?.quiz && article.quiz.question && article.quiz.answer_a && article.quiz.answer_b && article.quiz.answer_c && article.quiz.answer_d && article.quiz.correct_answer) {
      return {
        question: article.quiz.question,
        options: [
          { id: 'a', text: article.quiz.answer_a },
          { id: 'b', text: article.quiz.answer_b },
          { id: 'c', text: article.quiz.answer_c },
          { id: 'd', text: article.quiz.answer_d }
        ],
        correctAnswer: article.quiz.correct_answer.toLowerCase()
      };
    }
    
    return {
      question: "What is the main contribution of this research paper?",
      options: [
        { id: 'a', text: "A novel machine learning architecture that improves accuracy by 15%" },
        { id: 'b', text: "A comprehensive survey of existing methods in the field" },
        { id: 'c', text: "A new dataset for benchmarking AI models" },
        { id: 'd', text: "An optimization technique for faster model training" }
      ],
      correctAnswer: 'a'
    };
  };
  
  const quizData = getQuizData();

  // Check if user has already taken this quiz (correct or incorrect)
  useEffect(() => {
    if (isQuizOpen && article && (user || userProp)) {
      const checkSubmissionStatus = async () => {
        try {
          const userId = (user || userProp).id;
          const submission = await quizAPI.getUserQuizSubmission(userId, article.id);
          setQuizSubmission(submission);
        } catch (error) {
          console.error('Error checking submission status:', error);
        }
      };
      
      checkSubmissionStatus();
    }
  }, [isQuizOpen, article, user, userProp]);

  // Quiz handlers
  const handleOpenQuiz = () => {
    setIsQuizOpen(true);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setQuizSubmission(null); // Reset on open, will be fetched by useEffect
  };

  const handleCloseQuiz = () => {
    setIsQuizOpen(false);
    setSelectedAnswer(null);
    setShowQuizResult(false);
  };

  const handleSelectAnswer = (optionId) => {
    if (!showQuizResult) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswer && (user || userProp)) {
      const isCorrect = selectedAnswer === quizData.correctAnswer;
      
      // Record the submission (correct or incorrect) - user only gets one attempt
      try {
        const userId = (user || userProp).id;
        await quizAPI.recordQuizSubmission(userId, article.id, article.arxivId, isCorrect);
        
        // Update local state to reflect the submission
        setQuizSubmission({ answer_type: isCorrect ? 'true' : 'false' });
      } catch (error) {
        console.error('Failed to record quiz submission:', error);
      }
      
      setShowQuizResult(true);
    }
  };
  
  if (!isOpen || !article) return null;

  // Generate slug from paper title and arxiv ID for URL generation
  const generateSlug = (title, arxivId) => {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
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
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedPopup(true);
        setTimeout(() => {
          setShowCopiedPopup(false);
        }, 2000);
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedPopup(true);
        setTimeout(() => {
          setShowCopiedPopup(false);
        }, 2000);
      } catch (clipboardError) {
        prompt('Copy this link to share:', shareUrl);
      }
    }
  };

  // Filter categories
  const getFilteredCategories = () => {
    if (article.categories && article.categories.length > 0) {
      return article.categories.filter(category => !category.includes('.') && !category.includes(','));
    }
    return [article.category];
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
        <div 
          className={`rounded-2xl max-w-3xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
          {/* Minimal Header */}
          <div className={`flex-shrink-0 px-6 sm:px-8 pt-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Skill Level Badge */}
                {article.skillLevel && (
                  <div className="inline-flex items-center mb-3">
                    <span 
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: '#1db954' }}
                    >
                      <Brain className="w-3 h-3 mr-1.5" />
                      {article.skillLevel} Level
                    </span>
                  </div>
                )}
                
                {/* Title */}
                <h1 className={`text-xl sm:text-2xl font-bold leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {article.title}
                </h1>
              </div>
              
              {/* Close & Favorite */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onToggleFavorite(article.id)}
                  className={`p-2.5 rounded-full transition-all duration-200 ${
                    isFavorite 
                      ? isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-50 text-red-500'
                      : isDarkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }`}
                  title={isFavorite ? 'Remove from saved' : 'Save article'}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className={`p-2.5 rounded-full transition-colors ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>

            {/* Meta Info Row */}
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="inline-flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                {formatDate(article.publishedDate)}
              </span>
              <span className="inline-flex items-center flex-wrap gap-1.5">
                <Tag className="w-4 h-4 mr-0.5" />
                {getFilteredCategories().map((cat, idx) => (
                  <span key={idx} className={`px-2 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {cat}
                  </span>
                ))}
              </span>
              {commentCount > 0 && (
                <span className="inline-flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 sm:px-8 py-6 space-y-8">
              
              {/* Key Insight - The Star of the Show */}
              <section>
                <p className={`text-lg sm:text-xl leading-relaxed font-light ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {article.shortDescription}
                </p>
              </section>

              {/* Action Bar */}
              <section className="flex flex-wrap gap-3">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-5 py-2.5 font-medium rounded-xl transition-all text-sm group ${
                    isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Read Full Paper
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                
                <button
                  onClick={handleOpenQuiz}
                  className="inline-flex items-center px-5 py-2.5 text-white font-medium rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#1db954' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Test Knowledge
                </button>
                
                <button
                  onClick={handleShare}
                  className={`inline-flex items-center px-5 py-2.5 font-medium rounded-xl transition-colors text-sm ${
                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </section>

              {/* AI Summary - Clean Card */}
              {article.summaryContent && (
                <section className={`rounded-2xl p-6 border ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700' 
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Summary</h2>
                  </div>
                  <div className={`leading-relaxed whitespace-pre-wrap text-[15px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {article.summaryContent}
                  </div>
                </section>
              )}

              {/* Technical Details - Collapsible */}
              <section className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors text-left ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Technical Details</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showTechnicalDetails ? 'rotate-180' : ''}`} />
                </button>
                
                {showTechnicalDetails && (
                  <div className={`px-6 py-5 space-y-5 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                    {/* Original Title */}
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Original Title</h4>
                      <p className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{article.originalTitle}</p>
                    </div>
                    
                    {/* Abstract */}
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Research Abstract</h4>
                      {isLoadingAbstract ? (
                        <p className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading abstract...</p>
                      ) : (
                        <p className={`leading-relaxed text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {fullAbstract || article.originalAbstract || article.shortDescription}
                        </p>
                      )}
                    </div>

                    {/* Authors */}
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Authors</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{article.authors}</p>
                    </div>

                    {/* Categories */}
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Research Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {getFilteredCategories().map((category, index) => (
                          <span 
                            key={index}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Discussion Section */}
              <section className="pt-2">
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="h-5 w-5" style={{ color: '#1db954' }} />
                  <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Discussion</h2>
                  {commentCount > 0 && (
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({commentCount})</span>
                  )}
                </div>

                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts on this research..."
                        className={`w-full p-4 pr-24 border rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-700' 
                            : 'bg-gray-50 border-gray-200 focus:bg-white'
                        }`}
                        rows="3"
                        maxLength={2000}
                        disabled={isSubmittingComment}
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className={`absolute bottom-3 right-3 p-2.5 rounded-lg text-white disabled:cursor-not-allowed transition-colors ${
                          isDarkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300'
                        }`}
                        style={{ backgroundColor: newComment.trim() && !isSubmittingComment ? '#1db954' : undefined }}
                      >
                        {isSubmittingComment ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className={`flex justify-between mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>{newComment.length}/2000</span>
                    </div>
                    {commentErrors.submit && (
                      <p className="text-red-500 text-sm mt-2">{commentErrors.submit}</p>
                    )}
                  </form>
                ) : (
                  <div className={`mb-6 p-4 rounded-xl text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sign in to join the discussion
                    </p>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-500"></div>
                    </div>
                  ) : commentErrors.load ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 text-sm">{commentErrors.load}</p>
                      <button onClick={loadComments} className="mt-2 text-sm font-medium" style={{ color: '#1db954' }}>
                        Try Again
                      </button>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className={`h-10 w-10 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-200'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No comments yet. Start the conversation!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold" style={{ backgroundColor: '#1db954' }}>
                            {comment.user_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{comment.user_name}</span>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {formatCommentDate(comment.created_at)}
                                  {comment.is_edited && <span className="ml-1">(edited)</span>}
                                </span>
                                {user && user.id === comment.user_id && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditComment(comment)}
                                      className={`p-1 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className={`p-1 ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {(comment.user_title || comment.user_institution) && (
                                <p className={`text-xs italic mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {comment.user_title}{comment.user_title && comment.user_institution ? ' — ' : ''}{comment.user_institution}
                                </p>
                              )}
                            </div>
                            
                            {editingCommentId === comment.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-sm ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'
                                  }`}
                                  rows="3"
                                  maxLength={2000}
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={handleCancelEdit} className={`px-3 py-1.5 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(comment.id)}
                                    disabled={!editingCommentText.trim()}
                                    className={`px-3 py-1.5 text-white text-sm font-medium rounded-lg ${isDarkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300'}`}
                                    style={{ backgroundColor: editingCommentText.trim() ? '#1db954' : undefined }}
                                  >
                                    Save
                                  </button>
                                </div>
                                {commentErrors[comment.id] && (
                                  <p className="text-red-500 text-xs">{commentErrors[comment.id]}</p>
                                )}
                              </div>
                            ) : (
                              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {comment.comment_text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Link Copied Toast */}
      {showCopiedPopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-lg">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Link copied to clipboard</span>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className={`rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Quiz Header */}
            <div className={`px-6 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Knowledge Check</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Earn PEAR tokens for correct answers</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseQuiz}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Quiz Content */}
            {!(user || userProp) ? (
              // Auth prompt
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1db954' }}>
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Unlock Quizzes</h4>
                <p className={`mb-6 max-w-sm mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a free account to test your knowledge and earn PEAR tokens.
                </p>
                <button
                  onClick={() => {
                    handleCloseQuiz();
                    if (onOpenAccountModal) onOpenAccountModal();
                  }}
                  className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all"
                  style={{ backgroundColor: '#1db954' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
                >
                  <User className="h-5 w-5 mr-2" />
                  Create Free Account
                </button>
              </div>
            ) : quizSubmission?.answer_type === 'true' ? (
              // Already completed correctly
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1db954' }}>
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Already Completed!</h4>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You've already earned your token for this quiz.</p>
                <div className={`inline-flex items-center px-4 py-2 font-bold rounded-lg ${isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  1 PEAR Token Earned
                </div>
              </div>
            ) : quizSubmission?.answer_type === 'false' ? (
              // Already attempted but answered incorrectly
              <div className="p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <XCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quiz Already Attempted</h4>
                <p className={`mb-6 max-w-sm mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Unfortunately, you didn't get this one right. Each quiz can only be attempted once, but don't worry — there's plenty more research to explore!
                </p>
                <button
                  onClick={handleCloseQuiz}
                  className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all"
                  style={{ backgroundColor: '#1db954' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explore Other Research
                </button>
              </div>
            ) : (
              // Quiz questions
              <div className="p-6 space-y-6">
                {/* Question */}
                <div>
                  <p className={`font-medium text-lg leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{quizData.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {quizData.options.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.id === quizData.correctAnswer;
                    const showAsCorrect = showQuizResult && isSelected && isCorrect;
                    const showAsIncorrect = showQuizResult && isSelected && !isCorrect;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectAnswer(option.id)}
                        disabled={showQuizResult}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          showAsCorrect
                            ? isDarkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-500'
                            : showAsIncorrect
                            ? isDarkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500'
                            : isSelected
                            ? isDarkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-500'
                            : isDarkMode 
                              ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${showQuizResult ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                              showAsCorrect
                                ? 'bg-green-500 text-white'
                                : showAsIncorrect
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? 'text-white'
                                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}
                            style={isSelected && !showQuizResult ? { backgroundColor: '#1db954' } : {}}
                          >
                            {showAsCorrect ? <Check className="h-4 w-4" /> : showAsIncorrect ? <X className="h-4 w-4" /> : option.id.toUpperCase()}
                          </div>
                          <p className={`flex-1 text-sm ${
                            showAsCorrect ? 'text-green-900' : showAsIncorrect ? 'text-red-900' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {option.text}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Result */}
                {showQuizResult && (
                  <div className={`rounded-xl p-5 ${
                    selectedAnswer === quizData.correctAnswer
                      ? isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                      : isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {selectedAnswer === quizData.correctAnswer ? (
                        <>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>Correct! 🎉</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>You earned 1 PEAR token</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>Not quite right</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Each quiz can only be attempted once</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {!showQuizResult ? (
                    <>
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={!selectedAnswer}
                        className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all ${
                          isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'
                        }`}
                        style={{ backgroundColor: selectedAnswer ? '#1db954' : undefined }}
                      >
                        Submit Answer
                      </button>
                      <button
                        onClick={handleCloseQuiz}
                        className={`px-6 py-3 font-medium rounded-xl transition-colors ${
                          isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                    </>
                  ) : selectedAnswer === quizData.correctAnswer ? (
                    <button
                      onClick={handleCloseQuiz}
                      className="w-full py-3 text-white font-semibold rounded-xl transition-all"
                      style={{ backgroundColor: '#1db954' }}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      onClick={handleCloseQuiz}
                      className="w-full py-3 text-white font-semibold rounded-xl transition-all"
                      style={{ backgroundColor: '#1db954' }}
                    >
                      Explore Other Research
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleModal;
