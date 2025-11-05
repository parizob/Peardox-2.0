# Quiz Tracking Implementation

## 📋 Overview
This document explains the quiz tracking system that records when users answer quiz questions correctly.

---

## 🗄️ Database Setup

### Step 1: Create the Table in Supabase

Run the SQL file `quiz_correct_answers_table.sql` in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `quiz_correct_answers_table.sql`
4. Execute the SQL

### Table Schema

```sql
CREATE TABLE quiz_correct_answers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arxiv_paper_id BIGINT NOT NULL,
  arxiv_id TEXT NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, arxiv_paper_id)
);
```

**Key Features:**
- **user_id**: Links to authenticated users
- **arxiv_paper_id**: Internal paper ID from `v_arxiv_papers.id`
- **arxiv_id**: ArXiv ID string (e.g., "2301.12345")
- **UNIQUE constraint**: Prevents duplicate entries per user/paper
- **RLS enabled**: Users can only see/insert their own records

---

## 🔧 Application Implementation

### Files Modified

1. **`src/lib/supabase.js`** - Added `quizAPI` with 4 methods
2. **`src/components/ArticleModal.jsx`** - Integrated quiz tracking on submit

### API Methods Available

#### 1. `quizAPI.recordCorrectAnswer(userId, arxivPaperId, arxivId)`
Records when a user answers correctly.

**Parameters:**
- `userId` (string): UUID of authenticated user
- `arxivPaperId` (number): Internal paper ID
- `arxivId` (string): ArXiv ID string

**Returns:**
```javascript
{
  success: true,
  data: {...},
  alreadyRecorded: false
}
```

**Example:**
```javascript
const result = await quizAPI.recordCorrectAnswer(
  user.id,
  article.id,
  article.arxivId
);
```

#### 2. `quizAPI.getUserCorrectAnswers(userId)`
Retrieves all correct answers for a user.

**Returns:** Array of correct answer records

**Example:**
```javascript
const answers = await quizAPI.getUserCorrectAnswers(user.id);
console.log(`User has ${answers.length} correct answers`);
```

#### 3. `quizAPI.hasUserAnsweredCorrectly(userId, arxivPaperId)`
Checks if user has already answered a specific quiz correctly.

**Returns:** Boolean

**Example:**
```javascript
const hasAnswered = await quizAPI.hasUserAnsweredCorrectly(
  user.id,
  article.id
);
```

#### 4. `quizAPI.getQuizCorrectCount(arxivPaperId)`
Gets total count of users who answered a quiz correctly.

**Returns:** Number

**Example:**
```javascript
const count = await quizAPI.getQuizCorrectCount(article.id);
console.log(`${count} users answered correctly`);
```

---

## 🎯 How It Works

### User Flow

1. **User opens article modal** → Quiz button appears
2. **User clicks "Quiz" button** → 
   - If **not authenticated**: Shows "Create Account" prompt
   - If **authenticated**: Shows quiz
3. **User selects answer and submits** → 
   - Quiz shows result
   - If **correct**: Automatically records to database
   - If **incorrect**: Nothing is recorded
4. **Future attempts** → 
   - Duplicate correct answers are handled gracefully
   - `UNIQUE` constraint prevents duplicates

### Recording Logic

Located in `ArticleModal.jsx` → `handleSubmitQuiz()`:

```javascript
const handleSubmitQuiz = async () => {
  if (selectedAnswer) {
    setShowQuizResult(true);
    
    // Record correct answer to database if user is authenticated
    const isCorrect = selectedAnswer === quizData.correctAnswer;
    if (isCorrect && (user || userProp)) {
      try {
        const userId = (user || userProp).id;
        const result = await quizAPI.recordCorrectAnswer(
          userId,
          article.id,
          article.arxivId
        );
        
        if (result.alreadyRecorded) {
          console.log('✅ Quiz answer was already recorded for this user');
        } else {
          console.log('✅ Correct quiz answer recorded successfully');
        }
      } catch (error) {
        console.error('❌ Failed to record correct answer:', error);
        // Don't show error to user, just log it
      }
    }
  }
};
```

---

## 📊 Analytics & Queries

### Useful SQL Queries

#### Get user's quiz statistics
```sql
SELECT 
  COUNT(*) as total_correct,
  MIN(answered_at) as first_correct_answer,
  MAX(answered_at) as latest_correct_answer
FROM quiz_correct_answers
WHERE user_id = 'USER_UUID_HERE';
```

#### Get most popular quizzes
```sql
SELECT 
  arxiv_id,
  arxiv_paper_id,
  COUNT(*) as correct_count
FROM quiz_correct_answers
GROUP BY arxiv_id, arxiv_paper_id
ORDER BY correct_count DESC
LIMIT 10;
```

#### Get user leaderboard
```sql
SELECT 
  user_id,
  COUNT(*) as correct_answers,
  COUNT(DISTINCT DATE(answered_at)) as active_days
FROM quiz_correct_answers
GROUP BY user_id
ORDER BY correct_answers DESC
LIMIT 100;
```

#### Check quiz difficulty (lower % = harder)
```sql
WITH quiz_attempts AS (
  SELECT 
    arxiv_paper_id,
    COUNT(*) as correct_count
  FROM quiz_correct_answers
  GROUP BY arxiv_paper_id
),
total_views AS (
  SELECT 
    article_id,
    COUNT(DISTINCT user_id) as view_count
  FROM viewed_articles
  GROUP BY article_id
)
SELECT 
  qa.arxiv_paper_id,
  qa.correct_count,
  tv.view_count,
  ROUND(100.0 * qa.correct_count / tv.view_count, 2) as success_rate
FROM quiz_attempts qa
LEFT JOIN total_views tv ON qa.arxiv_paper_id = tv.article_id
WHERE tv.view_count > 10
ORDER BY success_rate ASC;
```

---

## 🔒 Security Features

### Row Level Security (RLS)

The table has RLS enabled with these policies:

1. **View own records**: Users can only see their own correct answers
2. **Insert own records**: Users can only insert records for themselves
3. **User validation**: `auth.uid()` ensures authenticated users only

### Data Integrity

- **Foreign key**: `user_id` references `auth.users` with `ON DELETE CASCADE`
- **Unique constraint**: Prevents duplicate records per user/paper
- **Not null constraints**: Ensures required fields are populated

---

## 🚀 Future Enhancements

Consider adding:

1. **Track incorrect answers** for analytics
2. **Time tracking** for quiz completion time
3. **Multiple attempts** tracking (remove UNIQUE constraint)
4. **Quiz difficulty ratings** based on success rates
5. **User badges/achievements** based on correct answers
6. **Quiz streaks** for gamification

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Column quiz_correct_answers.user_id violates foreign key constraint"
- **Fix**: Ensure user is authenticated before calling `recordCorrectAnswer()`

**Issue**: "Duplicate key value violates unique constraint"
- **Fix**: This is handled gracefully by checking `error.code === '23505'`

**Issue**: "RLS policy violation"
- **Fix**: Ensure RLS policies are created and user is authenticated

### Debug Logging

The app includes comprehensive logging:
- `🎯 Recording correct quiz answer:` - When recording starts
- `✅ Correct answer recorded successfully` - On success
- `ℹ️ User already has a correct answer recorded` - On duplicate
- `❌ Error recording correct answer:` - On error

---

## ✅ Testing Checklist

1. [ ] SQL table created in Supabase
2. [ ] RLS policies are active
3. [ ] Authenticated user can submit quiz
4. [ ] Correct answer is recorded in database
5. [ ] Duplicate attempts are handled gracefully
6. [ ] Unauthenticated users see "Create Account" prompt
7. [ ] Console logs show successful recording

---

## 📝 Notes

- Only **correct** answers are tracked (incorrect answers are not stored)
- Users must be **authenticated** to have answers recorded
- The `UNIQUE` constraint ensures **one record per user per quiz**
- All timestamps are stored in **UTC** (`TIMESTAMPTZ`)

---

**Created**: November 5, 2025  
**Version**: 1.0

