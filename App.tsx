import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import { DocumentProcessor } from './services/DocumentProcessor';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocument, setProcessedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = async (fileContent: string, fileName: string, fileType: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert string to ArrayBuffer for processing
      const buffer = await stringToArrayBuffer(fileContent);
      
      // Process the document
      const result = await DocumentProcessor.processDocument(buffer, fileType);
      
      // Extract questions and requirements
      const questions = DocumentProcessor.identifyQuestions(result.text);
      const requirements = DocumentProcessor.extractRequirements(result.text);
      
      // Set the processed document with all extracted information
      setProcessedDocument({
        ...result,
        fileName,
        fileType,
        questions,
        requirements,
        // Generate a simple summary (in a real app, this would use more sophisticated NLP)
        summary: `This is an RFP document titled "${result.metadata.title}" with ${result.metadata.pageCount} pages. It contains ${questions.length} questions and ${requirements.length} requirements.`
      });
    } catch (err) {
      console.error('Error processing document:', err);
      setError('Failed to process document. Please try again with a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to convert string to ArrayBuffer
  const stringToArrayBuffer = async (str: string): Promise<ArrayBuffer> => {
    // In a real implementation, we would handle the conversion properly
    // For now, we'll create a simple buffer
    const buffer = new ArrayBuffer(str.length * 2);
    const view = new Uint16Array(buffer);
    for (let i = 0; i < str.length; i++) {
      view[i] = str.charCodeAt(i);
    }
    return buffer;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">RFP Analyzer</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!processedDocument ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Upload an RFP Document</h2>
              <FileUpload onFileProcessed={handleFileProcessed} />
              
              {isProcessing && (
                <div className="mt-8 text-center">
                  <p className="text-gray-500">Processing document...</p>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {processedDocument.fileName}
                  </h3>
                  <button
                    onClick={() => setProcessedDocument(null)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Upload New Document
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {processedDocument.metadata.pageCount} pages • Processed on {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['summary', 'questions', 'requirements'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {activeTab === 'summary' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Executive Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700">{processedDocument.summary}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h5 className="text-md font-medium text-gray-900 mb-2">Document Metadata</h5>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Title</dt>
                          <dd className="mt-1 text-sm text-gray-900">{processedDocument.metadata.title}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Author</dt>
                          <dd className="mt-1 text-sm text-gray-900">{processedDocument.metadata.author}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Creation Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(processedDocument.metadata.creationDate).toLocaleDateString()}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Page Count</dt>
                          <dd className="mt-1 text-sm text-gray-900">{processedDocument.metadata.pageCount}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
                
                {activeTab === 'questions' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Extracted Questions</h4>
                    {processedDocument.questions.length > 0 ? (
                      <ul className="space-y-3">
                        {processedDocument.questions.map((question: string, index: number) => (
                          <li key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex">
                              <span className="font-medium text-gray-900 mr-2">{index + 1}.</span>
                              <span className="text-gray-700">{question}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No questions were identified in this document.</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'requirements' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Requirements Table</h4>
                    {processedDocument.requirements.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Page
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Criticality
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deadline
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {processedDocument.requirements.map((req: any) => (
                              <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {req.id}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {req.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {req.pageReference}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    req.criticality === 'Mandatory' 
                                      ? 'bg-red-100 text-red-800' 
                                      : req.criticality === 'Recommended'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                  }`}>
                                    {req.criticality}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {req.deadline || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No requirements were identified in this document.</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                  >
                    Export to Excel
                  </button>
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                  >
                    Export to PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
