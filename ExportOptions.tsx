import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';

interface ExportOptionsProps {
  documentData: {
    fileName: string;
    summary: string;
    questions: string[];
    requirements: any[];
  };
}

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#F0F0F0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  question: {
    fontSize: 12,
    marginBottom: 5,
  },
});

// PDF Document Component
const RfpPdfDocument = ({ documentData }: { documentData: ExportOptionsProps['documentData'] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>RFP Analysis: {documentData.fileName}</Text>
        
        <Text style={styles.subtitle}>Executive Summary</Text>
        <Text style={styles.text}>{documentData.summary}</Text>
        
        <Text style={styles.subtitle}>Extracted Questions</Text>
        {documentData.questions.map((question, index) => (
          <Text key={index} style={styles.question}>
            {index + 1}. {question}
          </Text>
        ))}
        
        <Text style={styles.subtitle}>Requirements Table</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: '15%' }]}>ID</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>Description</Text>
            <Text style={[styles.tableCell, { width: '10%' }]}>Page</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>Criticality</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>Deadline</Text>
          </View>
          
          {/* Table Rows */}
          {documentData.requirements.map((req) => (
            <View key={req.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '15%' }]}>{req.id}</Text>
              <Text style={[styles.tableCell, { width: '40%' }]}>{req.description}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{req.pageReference}</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{req.criticality}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{req.deadline || 'N/A'}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

const ExportOptions: React.FC<ExportOptionsProps> = ({ documentData }) => {
  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create summary worksheet
    const summaryData = [
      ['RFP Analysis Summary'],
      ['Filename', documentData.fileName],
      [''],
      ['Executive Summary'],
      [documentData.summary],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Create questions worksheet
    const questionsData = [
      ['Extracted Questions'],
      [''],
      ...documentData.questions.map((q, i) => [`${i + 1}. ${q}`]),
    ];
    const questionsWs = XLSX.utils.aoa_to_sheet(questionsData);
    XLSX.utils.book_append_sheet(wb, questionsWs, 'Questions');
    
    // Create requirements worksheet
    const requirementsHeaders = [['ID', 'Description', 'Page', 'Criticality', 'Deadline']];
    const requirementsData = documentData.requirements.map(req => [
      req.id,
      req.description,
      req.pageReference,
      req.criticality,
      req.deadline || 'N/A'
    ]);
    const requirementsWs = XLSX.utils.aoa_to_sheet([...requirementsHeaders, ...requirementsData]);
    XLSX.utils.book_append_sheet(wb, requirementsWs, 'Requirements');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${documentData.fileName.split('.')[0]}_analysis.xlsx`);
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={exportToExcel}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
      >
        Export to Excel
      </button>
      
      <PDFDownloadLink
        document={<RfpPdfDocument documentData={documentData} />}
        fileName={`${documentData.fileName.split('.')[0]}_analysis.pdf`}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
      >
        {({ loading }) => (loading ? 'Generating PDF...' : 'Export to PDF')}
      </PDFDownloadLink>
    </div>
  );
};

export default ExportOptions;
