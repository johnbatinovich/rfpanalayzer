import React, { useState, useEffect } from 'react';
import { DocumentProcessor } from '../services/DocumentProcessor';

interface SummaryEditorProps {
  documentText: string;
  initialSummary: string;
  onSummaryChange: (summary: string) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({ 
  documentText, 
  initialSummary, 
  onSummaryChange 
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyInsights, setKeyInsights] = useState<string[]>([]);

  useEffect(() => {
    // Extract key insights when component mounts
    extractKeyInsights();
  }, [documentText]);

  const extractKeyInsights = () => {
    // In a real implementation, this would use more sophisticated NLP
    // For now, we'll use a simple approach to identify potential key insights
    const insights = [];
    
    // Look for advertiser name
    const advertiserMatch = documentText.match(/advertiser[:\s]+([A-Za-z0-9\s&]+)/i);
    if (advertiserMatch && advertiserMatch[1]) {
      insights.push(`Advertiser: ${advertiserMatch[1].trim()}`);
    }
    
    // Look for agency name
    const agencyMatch = documentText.match(/agency[:\s]+([A-Za-z0-9\s&]+)/i);
    if (agencyMatch && agencyMatch[1]) {
      insights.push(`Agency: ${agencyMatch[1].trim()}`);
    }
    
    // Look for budget
    const budgetMatch = documentText.match(/budget[:\s]+([$€£]?[0-9,.]+\s*[kKmMbB]?)/i);
    if (budgetMatch && budgetMatch[1]) {
      insights.push(`Budget: ${budgetMatch[1].trim()}`);
    }
    
    // Look for timeline/deadline
    const deadlineMatch = documentText.match(/deadline[:\s]+([A-Za-z0-9\s,]+)/i);
    if (deadlineMatch && deadlineMatch[1]) {
      insights.push(`Deadline: ${deadlineMatch[1].trim()}`);
    }
    
    // Look for target audience/demographics
    const demographicsMatch = documentText.match(/target\s+(?:audience|demographics)[:\s]+([^\.]+)/i);
    if (demographicsMatch && demographicsMatch[1]) {
      insights.push(`Target Demographics: ${demographicsMatch[1].trim()}`);
    }
    
    setKeyInsights(insights);
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
    onSummaryChange(e.target.value);
  };

  const generateAISummary = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate an AI-generated summary
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Generate a more detailed summary based on the document text
      const sections = identifyKeySections(documentText);
      const aiSummary = generateSummaryFromSections(sections);
      
      setSummary(aiSummary);
      onSummaryChange(aiSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const identifyKeySections = (text: string): Record<string, string> => {
    // In a real implementation, this would use more sophisticated NLP
    // For now, we'll use a simple approach to identify key sections
    const sections: Record<string, string> = {};
    
    // Look for common RFP sections
    const sectionPatterns = [
      { name: 'Scope of Work', pattern: /scope\s+of\s+work/i },
      { name: 'Requirements', pattern: /requirements/i },
      { name: 'Evaluation Criteria', pattern: /evaluation\s+criteria/i },
      { name: 'Timeline', pattern: /timeline/i },
      { name: 'Budget', pattern: /budget/i }
    ];
    
    // Simple section extraction (in a real app, this would be more sophisticated)
    const paragraphs = text.split('\n\n');
    
    for (const pattern of sectionPatterns) {
      for (let i = 0; i < paragraphs.length; i++) {
        if (pattern.pattern.test(paragraphs[i])) {
          // Found a section, extract it and the next paragraph as content
          sections[pattern.name] = paragraphs[i] + (paragraphs[i+1] ? '\n\n' + paragraphs[i+1] : '');
          break;
        }
      }
    }
    
    return sections;
  };

  const generateSummaryFromSections = (sections: Record<string, string>): string => {
    // Generate a summary based on identified sections
    let summary = 'This RFP requests proposals for ';
    
    if (sections['Scope of Work']) {
      summary += sections['Scope of Work'].substring(0, 100).replace(/scope\s+of\s+work[:\s]*/i, '') + '. ';
    } else {
      summary += 'services as detailed in the document. ';
    }
    
    if (sections['Requirements']) {
      summary += 'Key requirements include ' + sections['Requirements'].substring(0, 100).replace(/requirements[:\s]*/i, '') + '. ';
    }
    
    if (sections['Timeline']) {
      summary += 'The project timeline indicates ' + sections['Timeline'].substring(0, 100).replace(/timeline[:\s]*/i, '') + '. ';
    }
    
    if (sections['Budget']) {
      summary += 'Budget considerations include ' + sections['Budget'].substring(0, 100).replace(/budget[:\s]*/i, '') + '. ';
    }
    
    if (sections['Evaluation Criteria']) {
      summary += 'Proposals will be evaluated based on ' + sections['Evaluation Criteria'].substring(0, 100).replace(/evaluation\s+criteria[:\s]*/i, '') + '.';
    }
    
    return summary;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Executive Summary</h4>
        <button
          onClick={generateAISummary}
          disabled={isGenerating}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate AI Summary'}
        </button>
      </div>
      
      <textarea
        value={summary}
        onChange={handleSummaryChange}
        className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        placeholder="Enter or generate an executive summary..."
      />
      
      {keyInsights.length > 0 && (
        <div className="mt-4">
          <h5 className="text-md font-medium text-gray-900 mb-2">Key Insights</h5>
          <div className="bg-gray-50 p-3 rounded-md">
            <ul className="space-y-1">
              {keyInsights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryEditor;
