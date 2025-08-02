-- Actual structure of summary_papers table
-- This table contains skill-level specific summaries for research papers

/*
Actual columns in summary_papers table:

- id: UUID (unique identifier for the summary)
- arxiv_paper_id: UUID (foreign key to v_arxiv_papers.id)
- arxiv_id: TEXT (ArXiv identifier)
- beginner_title: TEXT (simplified title for beginners)
- intermediate_title: TEXT (intermediate-level title)
- beginner_overview: TEXT (brief overview for beginners)
- intermediate_overview: TEXT (overview for intermediate users)
- beginner_summary: TEXT (detailed summary for beginners)
- intermediate_summary: TEXT (detailed summary for intermediate users)
- processing_status: TEXT ('completed', 'processing', 'failed')
- processing_error: TEXT (error message if processing failed)
- gemini_model: TEXT (AI model used for generation)
- created_at: TIMESTAMPTZ (when the summary was created)
- updated_at: TIMESTAMPTZ (when the summary was last updated)

Example data structure:
- arxiv_paper_id: '123e4567-e89b-12d3-a456-426614174000'
- beginner_title: 'How Computers Learn to Recognize Images'
- beginner_overview: 'This research shows how artificial intelligence can identify objects in pictures, similar to how humans recognize faces.'
- beginner_summary: 'The researchers developed a new method for teaching computers to understand images...'
- intermediate_title: 'Advanced Computer Vision with Deep Learning Networks'
- intermediate_overview: 'A novel approach to image recognition using convolutional neural networks with improved accuracy metrics.'
- intermediate_summary: 'This paper presents a sophisticated deep learning architecture that enhances image classification...'
- processing_status: 'completed'
*/

-- Sample query to test the integration:
-- SELECT sp.*, ap.authors, ap.published_date 
-- FROM summary_papers sp
-- JOIN v_arxiv_papers ap ON sp.arxiv_paper_id = ap.id
-- WHERE sp.processing_status = 'completed'
-- ORDER BY ap.published_date DESC
-- LIMIT 10;

-- Example query for beginner summaries:
-- SELECT 
--   sp.arxiv_paper_id,
--   sp.beginner_title as title,
--   sp.beginner_overview as overview,
--   sp.beginner_summary as summary,
--   ap.authors,
--   ap.published_date
-- FROM summary_papers sp
-- JOIN v_arxiv_papers ap ON sp.arxiv_paper_id = ap.id
-- WHERE sp.processing_status = 'completed'
-- AND sp.beginner_title IS NOT NULL
-- ORDER BY ap.published_date DESC; 