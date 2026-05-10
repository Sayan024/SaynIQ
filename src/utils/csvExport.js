/**
 * Converts an array of objects into a CSV string and triggers a download
 * @param {Array<Object>} data - The data to export
 * @param {string} fileName - The name of the file
 */
export const downloadCSV = (data, fileName = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        // Handle values with commas or quotes
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
