/**
 * Parser Configuration
 * 
 * Update these selectors based on the actual structure of nsbonline.ru
 * To find selectors:
 * 1. Open nsbonline.ru in browser
 * 2. Right-click on element → Inspect
 * 3. Copy the CSS selector
 */

export const parserConfig = {
  // URL settings
  baseUrl: 'https://nsbonline.ru',
  timeout: 10000, // 10 seconds
  
  // Selectors for homework elements
  selectors: {
    // Main container with all homework
    homeworkContainer: '.homework-container', // Update this
    
    // Individual homework items
    homeworkItem: '.homework-item', // Update this
    
    // Date element
    date: '.date', // Update this
    
    // File links
    fileLink: '.file-link a', // Update this
    
    // Homework content
    content: '.content', // Update this
    
    // Task items
    taskItem: '.task', // Update this
    
    // Task question/title
    taskQuestion: '.task-title', // Update this
    
    // Task answer/description
    taskAnswer: '.task-description', // Update this
  },
  
  // Parsing options
  options: {
    // Remove these CSS classes from content
    removeClasses: ['hidden', 'deprecated'],
    
    // Convert relative URLs to absolute
    fixUrls: true,
    
    // Clean up HTML
    cleanHtml: true,
    
    // Log parsing details
    debug: false,
  },
  
  // Schedule settings
  schedule: {
    enabled: true,
    intervalHours: 6,
    retryAttempts: 3,
    retryDelayMs: 5000,
  },
};

// Example of how to use selectors in parsing code:
/*
export function parseHomework(html: string): ParsedHomework[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const items = doc.querySelectorAll(parserConfig.selectors.homeworkItem);
  const entries: ParsedHomework[] = [];
  
  items.forEach((item, index) => {
    const dateEl = item.querySelector(parserConfig.selectors.date);
    const fileEl = item.querySelector(parserConfig.selectors.fileLink);
    const tasks = item.querySelectorAll(parserConfig.selectors.taskItem);
    
    const entry: ParsedHomework = {
      id: Date.now() + index,
      date: dateEl?.textContent?.trim() || '',
      file: fileEl?.getAttribute('href') || undefined,
      answers: [],
    };
    
    tasks.forEach((task, taskIndex) => {
      const question = task.querySelector(parserConfig.selectors.taskQuestion);
      const answer = task.querySelector(parserConfig.selectors.taskAnswer);
      
      entry.answers.push({
        id: Date.now() + index + taskIndex,
        question: question?.textContent?.trim() || '',
        answer: answer?.innerHTML || '',
      });
    });
    
    entries.push(entry);
  });
  
  return entries;
}
*/
