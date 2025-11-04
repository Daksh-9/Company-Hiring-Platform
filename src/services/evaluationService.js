import axios from 'axios';

export const evaluateParagraph = async (text) => {
  try {
    // First evaluate with LanguageTool API
    const languageToolResponse = await axios.post('https://api.languagetool.org/v2/check', {
      text,
      language: 'en-US'
    });

    const totalErrors = languageToolResponse.data.matches.length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate score
    const score = Math.max(0, Math.min(100, 100 - (totalErrors/words) * 100));
    
    // Determine pass/fail
    const result = score >= 40 ? 'Pass' : 'Fail';

    return {
      score: Math.round(score),
      result,
      totalErrors
    };
  } catch (error) {
    console.error('Error evaluating paragraph:', error);
    throw new Error('Failed to evaluate paragraph');
  }
};