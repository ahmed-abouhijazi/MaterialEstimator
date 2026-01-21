import { NextRequest, NextResponse } from 'next/server'
import type { EstimateResult } from '@/lib/calculations'
import { getProjectTypeLabel, getQualityLabel } from '@/lib/calculations'

export async function POST(request: NextRequest) {
  try {
    const result: EstimateResult = await request.json()

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(result)

    // For production, you'd want to use a service like Puppeteer or a PDF API
    // For now, we'll return the HTML that can be printed
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generatePDFHTML(result: EstimateResult): string {
  const { projectDetails, materials, subtotal, wasteBuffer, wasteBufferPercentage, total, projectId, generatedAt } = result

  // Group materials by category
  const grouped = materials.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof materials>)

  const categoriesHTML = Object.entries(grouped).map(([category, items]) => `
    <div class="category">
      <h3>${category}</h3>
      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.unit}</td>
              <td>$${item.unitPrice.toFixed(2)}</td>
              <td>$${item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>BuildCalc Pro - Estimate ${projectId}</title>
      <style>
        @media print {
          @page { margin: 0.5in; }
          body { margin: 0; }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 20px;
          color: #1e3a5f;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #1e3a5f;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #1e3a5f;
          margin: 0 0 10px 0;
          font-size: 32px;
        }
        
        .project-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .project-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
        }
        
        .info-label {
          font-weight: 600;
          color: #64748b;
        }
        
        .category {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .category h3 {
          background: #1e3a5f;
          color: white;
          padding: 10px 15px;
          margin: 0 0 10px 0;
          border-radius: 4px;
          font-size: 18px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th {
          background: #f1f5f9;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #cbd5e1;
        }
        
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        tr:hover {
          background: #f8fafc;
        }
        
        .summary {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
        }
        
        .summary-total {
          border-top: 2px solid #1e3a5f;
          margin-top: 10px;
          padding-top: 15px;
          font-weight: 700;
          font-size: 20px;
          color: #1e3a5f;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏗️ BuildCalc Pro</h1>
        <p style="margin: 5px 0; font-size: 18px;">Material Estimate Report</p>
        <p style="margin: 5px 0; color: #64748b;">Estimate ID: ${projectId}</p>
      </div>
      
      <div class="project-info">
        <h2 style="margin-top: 0; color: #1e3a5f;">Project Details</h2>
        <div class="project-info-grid">
          <div class="info-item">
            <span class="info-label">Project Type:</span>
            <span>${getProjectTypeLabel(projectDetails.projectType)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Quality Level:</span>
            <span>${getQualityLabel(projectDetails.qualityLevel)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Dimensions:</span>
            <span>${projectDetails.length}m × ${projectDetails.width}m × ${projectDetails.height}m</span>
          </div>
          <div class="info-item">
            <span class="info-label">Location:</span>
            <span>${projectDetails.location}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Generated:</span>
            <span>${new Date(generatedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
      
      <h2 style="color: #1e3a5f; margin-bottom: 20px;">Materials Breakdown</h2>
      ${categoriesHTML}
      
      <div class="summary">
        <h2 style="margin-top: 0; color: #1e3a5f;">Cost Summary</h2>
        <div class="summary-row">
          <span>Materials Subtotal:</span>
          <span>$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-row">
          <span>Waste Buffer (${wasteBufferPercentage}%):</span>
          <span>$${wasteBuffer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total Estimated Cost:</span>
          <span>$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Important Notes:</strong></p>
        <p style="margin: 10px 0;">
          • This estimate is based on industry-standard calculations and current market prices<br>
          • Actual costs may vary based on supplier pricing, market conditions, and project specifics<br>
          • Waste buffer included to account for cutting, breakage, and contingencies<br>
          • Labor costs, permits, and equipment rentals are not included<br>
          • Consult with local contractors for detailed quotes
        </p>
        <p style="margin-top: 20px; font-weight: 600;">
          Generated by BuildCalc Pro • buildcalc.pro
        </p>
      </div>
    </body>
    </html>
  `
}
