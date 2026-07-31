import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, X, Search, Filter, Download,
  Eye, MoreVertical, Trash2, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Loader
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { reports } from '../services/api'

export default function MedicalReports() {
  const [reportsList, setReportsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('Blood Test')
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await reports.list()
      setReportsList(data?.results || data || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert('Please upload PDF, JPG, or PNG files only')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setUploadFile(file)
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    try {
      await reports.upload(uploadTitle || uploadFile.name, uploadFile)
      await fetchReports()
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadTitle('')
      setUploadType('Blood Test')
    } catch (error) {
      alert('Failed to upload report. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    try {
      await reports.remove(id)
      setReportsList((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      alert('Failed to delete report')
    }
  }

  const handleViewAnalysis = (report) => {
    setSelectedReport(report)
    setShowAnalysisModal(true)
  }

  const filteredReports = reportsList.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'analyzed' && report.ai_summary) ||
      (filterStatus === 'pending' && !report.ai_summary)
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: reportsList.length,
    analyzed: reportsList.filter((r) => r.ai_summary).length,
    pending: reportsList.filter((r) => !r.ai_summary).length,
    shared: 0,
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Medical Reports</h1>
              <p className="text-[#64748B]">
                Upload, organize, and understand your medical reports with AI
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload New Report
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reports', value: stats.total, color: 'from-[#0F6FFF] to-[#14C8A8]' },
              { label: 'Analyzed', value: stats.analyzed, color: 'from-[#22C55E] to-[#14C8A8]' },
              { label: 'Pending', value: stats.pending, color: 'from-[#F59E0B] to-[#F97316]' },
              { label: 'Shared', value: stats.shared, color: 'from-[#8B5CF6] to-[#A78BFA]' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
              >
                <p className="text-sm text-[#64748B] mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 border border-[#E2E8F0] mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'analyzed', 'pending', 'shared'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    filterStatus === filter
                      ? 'bg-[#0F6FFF] text-white'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0F9FF]'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 text-[#0F6FFF] animate-spin" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-[#E2E8F0] mb-4" />
              <p className="text-[#64748B] mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'No reports found'
                  : 'No reports uploaded yet'}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-[#0F6FFF] hover:text-[#14C8A8] font-medium"
              >
                Upload your first report
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0F172A]">
                      Report Name
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0F172A]">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0F172A]">
                      Uploaded Date
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0F172A]">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0F172A]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F0F9FF] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#0F6FFF]" />
                          </div>
                          <span className="text-sm font-medium text-[#0F172A]">
                            {report.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#64748B]">
                          {report.file_type || 'PDF'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#64748B]">
                          {new Date(report.uploaded_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {report.ai_summary ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#22C55E] rounded-full text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Analyzed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] text-[#F59E0B] rounded-full text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewAnalysis(report)}
                            className="p-2 hover:bg-[#F0F9FF] rounded-lg transition-colors"
                            title="View Analysis"
                          >
                            <Eye className="w-4 h-4 text-[#64748B]" />
                          </button>
                          <a
                            href={report.file}
                            download
                            className="p-2 hover:bg-[#F0F9FF] rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-[#64748B]" />
                          </a>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-[#EF4444]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => !uploading && setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0F172A]">Upload New Report</h3>
                  <button
                    onClick={() => !uploading && setShowUploadModal(false)}
                    className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
                    disabled={uploading}
                  >
                    <X className="w-5 h-5 text-[#64748B]" />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Report Name
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="E.g., CBC Blood Test"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Report Type
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6FFF]/30"
                    >
                      <option>Blood Test</option>
                      <option>X-Ray</option>
                      <option>MRI Scan</option>
                      <option>CT Scan</option>
                      <option>Ultrasound</option>
                      <option>ECG</option>
                      <option>Prescription</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Upload File
                    </label>
                    <div
                      className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center hover:border-[#0F6FFF]/40 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      {uploadFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-8 h-8 text-[#0F6FFF]" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-[#0F172A]">
                              {uploadFile.name}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {(uploadFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-[#64748B] mb-2" />
                          <p className="text-sm text-[#64748B] mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            PDF, JPG, PNG (Max 10MB)
                          </p>
                        </>
                      )}
                      <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="w-full bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Uploading & Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload & Analyze
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Modal */}
        <AnimatePresence>
          {showAnalysisModal && selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={() => setShowAnalysisModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-3xl w-full my-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    {selectedReport.title}
                  </h3>
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#64748B]" />
                  </button>
                </div>

                {selectedReport.ai_summary ? (
                  <div className="space-y-6">
                    {/* AI Summary */}
                    <div className="bg-[#F0F9FF] rounded-xl p-6 border border-[#0F6FFF]/10">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0F6FFF] flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-[#0F172A] mb-2">
                            AI Summary
                          </h4>
                          <p className="text-sm text-[#64748B] leading-relaxed">
                            {selectedReport.ai_summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Findings */}
                    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4">
                        Key Findings
                      </h4>
                      <ul className="space-y-3">
                        {[
                          'All values within normal range',
                          'No immediate concerns identified',
                          'Follow-up recommended in 6 months',
                        ].map((finding, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[#0F172A]">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Important Values */}
                    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4">
                        Important Values
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Hemoglobin', value: '14.5 g/dL', status: 'normal' },
                          { label: 'White Blood Cells', value: '7,200/μL', status: 'normal' },
                          { label: 'Platelets', value: '220,000/μL', status: 'normal' },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3 border-b border-[#E2E8F0] last:border-0"
                          >
                            <span className="text-sm text-[#64748B]">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#0F172A]">
                                {item.value}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'normal'
                                    ? 'bg-[#F0FDF4] text-[#22C55E]'
                                    : 'bg-[#FEF3C7] text-[#F59E0B]'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* General Recommendations */}
                    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4">
                        General Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {[
                          'Continue maintaining a healthy lifestyle',
                          'Stay hydrated and eat a balanced diet',
                          'Regular exercise recommended',
                          'Schedule follow-up as advised by your doctor',
                        ].map((rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF]" />
                            <span className="text-sm text-[#64748B]">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Medical Disclaimer */}
                    <div className="bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-[#0F172A] mb-2">
                            Medical Disclaimer
                          </h4>
                          <p className="text-xs text-[#64748B] leading-relaxed">
                            AI-generated analysis is for informational purposes only and is not a
                            medical diagnosis. Consult a healthcare professional for medical
                            interpretation and advice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-[#F59E0B] mb-4" />
                    <p className="text-[#64748B] mb-4">
                      This report is pending AI analysis
                    </p>
                    <p className="text-sm text-[#94A3B8]">
                      Analysis will be available shortly
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
