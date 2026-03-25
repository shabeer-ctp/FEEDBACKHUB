export function analyzeSentiment(text: string): { 
  sentiment: 'positive' | 'negative' | 'neutral'; 
  score: number;
  isUrgent: boolean 
} {
  const words = text.toLowerCase().split(/\W+/);
  
  const POSITIVE_KEYWORDS: Record<string, number> = {
    'excellent': 3, 'great': 2, 'good': 1, 'happy': 2, 'love': 3, 'amazing': 3, 
    'perfect': 3, 'awesome': 2, 'best': 2, 'fantastic': 3, 'wonderful': 2,
    'satisfied': 2, 'recommend': 2, 'thanks': 1, 'thank': 1, 'helpful': 2,
    'brilliant': 3, 'superb': 3, 'outstanding': 3, 'impressive': 2
  };

  const NEGATIVE_KEYWORDS: Record<string, number> = {
    'bad': 2, 'broken': 3, 'slow': 2, 'hate': 3, 'terrible': 3, 'worst': 3, 
    'bug': 2, 'error': 3, 'fail': 3, 'poor': 2, 'crash': 3, 'issue': 2, 
    'problem': 2, 'annoying': 2, 'useless': 3, 'horrible': 3, 'awful': 3,
    'difficult': 2, 'frustrating': 2, 'disappointed': 2, 'waste': 3
  };

  const URGENT_KEYWORDS = [
    'urgent', 'emergency', 'asap', 'immediately', 'critical', 'stop', 
    'broken', 'crash', 'security', 'leak', 'hacked', 'down', 'offline'
  ];

  let score = 0;
  words.forEach(word => {
    if (POSITIVE_KEYWORDS[word]) score += POSITIVE_KEYWORDS[word];
    if (NEGATIVE_KEYWORDS[word]) score -= NEGATIVE_KEYWORDS[word];
  });

  // Normalize score (-100 to 100)
  const normalizedScore = Math.max(-100, Math.min(100, score * 10));

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (normalizedScore > 10) sentiment = 'positive';
  else if (normalizedScore < -10) sentiment = 'negative';

  const hasUrgentKeyword = URGENT_KEYWORDS.some(word => text.toLowerCase().includes(word));
  const isUrgent = hasUrgentKeyword || normalizedScore <= -30;

  return { sentiment, score: normalizedScore, isUrgent };
}

export function generateSummary(feedbacks: any[]) {
  if (feedbacks.length === 0) return "No feedback data available for summary.";
  
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'is', 'it', 'in', 'i', 'this', 'that', 'for', 'with', 'on', 'was']);
  
  feedbacks.forEach(f => {
    const words = (f.message || f.comment || "").toLowerCase().split(/\W+/);
    words.forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });
  });

  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  const topSentiment = feedbacks.filter(f => f.sentiment === 'positive').length > feedbacks.length / 2 ? 'positive' : 'mixed';
  
  return `Overall sentiment is ${topSentiment}. Users frequently mention: ${sortedWords.join(', ')}. ${feedbacks.filter(f => f.is_urgent).length} items require urgent attention.`;
}
