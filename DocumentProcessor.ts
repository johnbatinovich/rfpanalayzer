import * as pdfjs from 'pdfjs-dist';
import { Document, Packer, Paragraph } from 'docx';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ProcessedDocument {
  text: string;
  structure: DocumentStructure;
  metadata: DocumentMetadata;
}

interface DocumentStructure {
  sections: Section[];
}

interface Section {
  title: string;
  level: number;
  content: string;
  startPage: number;
}

interface DocumentMetadata {
  title: string;
  author: string;
  creationDate: string;
  pageCount: number;
}

export class DocumentProcessor {
  /**
   * Process a document file (PDF or DOCX)
   * @param fileBuffer ArrayBuffer containing the file data
   * @param fileType File extension ('pdf' or 'docx')
   * @returns Processed document with text, structure, and metadata
   */
  public static async processDocument(
    fileBuffer: ArrayBuffer,
    fileType: string
  ): Promise<ProcessedDocument> {
    if (fileType === 'pdf') {
      return this.processPdf(fileBuffer);
    } else if (fileType === 'docx') {
      return this.processDocx(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Process a PDF document
   * @param fileBuffer ArrayBuffer containing the PDF data
   * @returns Processed document with text, structure, and metadata
   */
  private static async processPdf(fileBuffer: ArrayBuffer): Promise<ProcessedDocument> {
    try {
      // Load the PDF document
      const loadingTask = pdfjs.getDocument({ data: fileBuffer });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;
      let fullText = '';
      const sections: Section[] = [];
      
      // Extract metadata
      const metadata = await pdf.getMetadata();
      const documentMetadata: DocumentMetadata = {
        title: metadata.info?.Title || 'Untitled',
        author: metadata.info?.Author || 'Unknown',
        creationDate: metadata.info?.CreationDate || new Date().toISOString(),
        pageCount: numPages
      };
      
      // Process each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Extract text from the page
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += pageText + '\n\n';
        
        // Attempt to identify sections based on text formatting
        // This is a simplified approach - in a real implementation,
        // we would use more sophisticated heuristics or ML models
        const lines = pageText.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.length < 100) {
            // Heuristic: Short lines that are all caps or end with a colon
            // are likely section headers
            if (
              trimmedLine === trimmedLine.toUpperCase() ||
              trimmedLine.endsWith(':')
            ) {
              sections.push({
                title: trimmedLine,
                level: trimmedLine === trimmedLine.toUpperCase() ? 1 : 2,
                content: '',
                startPage: i
              });
            } else if (sections.length > 0) {
              // Add content to the last section
              sections[sections.length - 1].content += trimmedLine + '\n';
            }
          }
        }
      }
      
      return {
        text: fullText,
        structure: { sections },
        metadata: documentMetadata
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF document');
    }
  }

  /**
   * Process a DOCX document
   * @param fileBuffer ArrayBuffer containing the DOCX data
   * @returns Processed document with text, structure, and metadata
   */
  private static async processDocx(fileBuffer: ArrayBuffer): Promise<ProcessedDocument> {
    try {
      // For DOCX processing, we would use the docx library
      // This is a simplified implementation
      const docx = await this.extractDocxContent(fileBuffer);
      
      return {
        text: docx.text,
        structure: { sections: docx.sections },
        metadata: {
          title: docx.title || 'Untitled',
          author: docx.author || 'Unknown',
          creationDate: docx.creationDate || new Date().toISOString(),
          pageCount: Math.ceil(docx.text.length / 3000) // Rough estimate
        }
      };
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error('Failed to process DOCX document');
    }
  }

  /**
   * Extract content from a DOCX document
   * @param fileBuffer ArrayBuffer containing the DOCX data
   * @returns Extracted text and document structure
   */
  private static async extractDocxContent(fileBuffer: ArrayBuffer): Promise<any> {
    // This is a placeholder for actual DOCX processing
    // In a real implementation, we would use the docx library to extract
    // text, headings, and structure from the document
    
    // For now, we'll return a simplified structure
    return {
      text: "This is placeholder text for DOCX processing. In a real implementation, we would extract the actual content from the DOCX file.",
      sections: [
        {
          title: "Introduction",
          level: 1,
          content: "Introduction content would go here.",
          startPage: 1
        },
        {
          title: "Requirements",
          level: 1,
          content: "Requirements content would go here.",
          startPage: 2
        }
      ],
      title: "Sample DOCX Document",
      author: "System",
      creationDate: new Date().toISOString()
    };
  }

  /**
   * Identify questions in the document text
   * @param text Document text
   * @returns Array of identified questions
   */
  public static identifyQuestions(text: string): string[] {
    const questions: string[] = [];
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      
      // Explicit questions (ending with question mark)
      if (trimmed.includes('?')) {
        questions.push(trimmed);
        continue;
      }
      
      // Implicit questions (requirements statements)
      if (
        trimmed.toLowerCase().includes('must provide') ||
        trimmed.toLowerCase().includes('shall provide') ||
        trimmed.toLowerCase().includes('is required') ||
        trimmed.toLowerCase().includes('are required') ||
        trimmed.toLowerCase().includes('please describe') ||
        trimmed.toLowerCase().includes('please explain')
      ) {
        questions.push(trimmed);
      }
    }
    
    return questions;
  }

  /**
   * Extract key requirements from document text
   * @param text Document text
   * @returns Array of requirements with metadata
   */
  public static extractRequirements(text: string): any[] {
    const requirements: any[] = [];
    let reqId = 1;
    
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      
      // Look for requirement indicators
      if (
        trimmed.toLowerCase().includes('must') ||
        trimmed.toLowerCase().includes('shall') ||
        trimmed.toLowerCase().includes('required') ||
        trimmed.toLowerCase().includes('mandatory') ||
        trimmed.toLowerCase().includes('requirement')
      ) {
        // Determine criticality
        let criticality = 'Optional';
        if (
          trimmed.toLowerCase().includes('must') ||
          trimmed.toLowerCase().includes('shall') ||
          trimmed.toLowerCase().includes('mandatory')
        ) {
          criticality = 'Mandatory';
        } else if (trimmed.toLowerCase().includes('should')) {
          criticality = 'Recommended';
        } else if (trimmed.toLowerCase().includes('may') || trimmed.toLowerCase().includes('optional')) {
          criticality = 'Optional';
        }
        
        // Extract deadlines (simplified approach)
        const deadlineMatch = trimmed.match(/by\s+(\w+\s+\d{1,2},\s+\d{4})/i);
        const deadline = deadlineMatch ? deadlineMatch[1] : '';
        
        requirements.push({
          id: `REQ-${reqId.toString().padStart(3, '0')}`,
          description: trimmed,
          criticality,
          deadline,
          pageReference: 'N/A' // Would be determined from page mapping in real implementation
        });
        
        reqId++;
      }
    }
    
    return requirements;
  }
}
