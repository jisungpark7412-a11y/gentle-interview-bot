const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company, category } = await req.json();

    if (!company) {
      return new Response(
        JSON.stringify({ success: false, error: 'Company name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Web scraping service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search queries based on category
    const categoryQueries = {
      'product_sense': `"${company}" product manager interview questions "product sense"`,
      'behavioral': `"${company}" interview questions behavioral "tell me about a time"`,
      'product_strategy': `"${company}" product strategy interview questions "should we build"`,
      'product_metrics': `"${company}" product metrics interview questions "how would you measure"`
    };

    const searchQuery = categoryQueries[category as keyof typeof categoryQueries] || 
                       `"${company}" interview questions ${category}`;

    console.log('Searching for company interview questions:', searchQuery);

    // Search for company-specific interview questions
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to search for company interview questions',
          fallbackQuestions: getDefaultQuestions(category)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract questions from the search results
    const extractedQuestions = extractQuestionsFromResults(searchData.data, company, category);

    if (extractedQuestions.length === 0) {
      console.log('No company-specific questions found, returning defaults');
      return new Response(
        JSON.stringify({ 
          success: true, 
          questions: getDefaultQuestions(category),
          company,
          isPersonalized: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${extractedQuestions.length} company-specific questions for ${company}`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        questions: extractedQuestions.slice(0, 6), // Limit to 6 questions
        company,
        isPersonalized: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error searching company questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to search for questions';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractQuestionsFromResults(results: any[], company: string, category: string): any[] {
  if (!results || !Array.isArray(results)) return [];
  
  const questions: any[] = [];
  const seen = new Set<string>();
  const questionPatterns = [
    /^\d+[\.\)]\s*(.+\?)/gm,
    /^[^\n]*\?$/gm,
    /^(How would you|What would you|Why would you|Tell me about|Describe|Explain|Walk me through|Design|Should|What is|What are|Why did|Why does).*\?$/gmi,
    /^[\-\*•]\s*(.+\?)/gm
  ];

  function cleanQuestion(raw: string): string {
    return raw
      .replace(/^\d+[\.\)]\s*/, '')
      .replace(/^[\-\*•]\s*/, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links
      .replace(/\*+/g, '')  // strip bold/italic markers
      .replace(/^#+\s*/, '') // strip heading markers
      .replace(/\s+/g, ' ')
      .trim();
  }

  results.forEach(result => {
    if (!result.markdown) return;
    
    const content = result.markdown.toLowerCase();
    if (!(content.includes('interview') || content.includes('question'))) return;

    questionPatterns.forEach(pattern => {
      const matches = result.markdown.match(pattern);
      if (!matches) return;
      matches.forEach((match: string) => {
        const cleaned = cleanQuestion(match);
        const lower = cleaned.toLowerCase();
        if (cleaned.length >= 20 && cleaned.length <= 200 && cleaned.endsWith('?') &&
            !lower.includes('practice') && !lower.includes('sign up') && !lower.includes('click here') &&
            !seen.has(lower)) {
          seen.add(lower);
          questions.push({
            question: cleaned,
            isPopular: lower.includes('common') || lower.includes('popular') || Math.random() > 0.7,
            source: result.url || 'web'
          });
        }
      });
    });
  });

  return questions;
}

function getDefaultQuestions(category: string): any[] {
  const defaultQuestions = {
    'behavioral': [
      { question: 'Tell me about yourself', isPopular: true },
      { question: 'Tell me about a time that you had a conflict with an engineering partner. How did you convince the engineering partner?', isPopular: true },
      { question: 'Tell me about a time that you made a long term trade off instead of a short term trade off?', isPopular: true },
      { question: 'What is your weakness?', isPopular: true },
      { question: 'What are your greatest strengths or your superpower?', isPopular: true },
      { question: 'You have 3 features your team wants to build — how do you decide what ships first?', isPopular: false }
    ],
    'product_sense': [
      { question: 'What is your favorite product? Why?', isPopular: false },
      { question: 'What is your most used product? How would you improve it?', isPopular: false },
      { question: 'Create an alarm clock for blind people?', isPopular: false },
      { question: 'How would you grow a new product in a new market?', isPopular: false }
    ],
    'product_strategy': [
      { question: 'Should Tiktok buy Snapchat?', isPopular: false },
      { question: 'Should Paypal invest in their own bitcoin product?', isPopular: false },
      { question: 'How would you measure trust in a Gen AI product?', isPopular: false },
      { question: 'A competitor just launched a feature that\'s hurting your retention — what do you do?', isPopular: false }
    ],
    'product_metrics': [
      { question: 'How would you measure the success of Instagram Stories?', isPopular: false },
      { question: 'Netflix\'s daily active users dropped 20% overnight — walk me through how you\'d investigate', isPopular: false },
      { question: 'How would you decide if a new feature was successful after launch?', isPopular: false },
      { question: 'What\'s the north star metric for Spotify? Why?', isPopular: false }
    ]
  };

  return defaultQuestions[category as keyof typeof defaultQuestions] || defaultQuestions.behavioral;
}