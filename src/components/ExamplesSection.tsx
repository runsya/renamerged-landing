import { motion } from 'framer-motion';
import { FileText, ArrowRight, FolderOpen } from 'lucide-react';

const examples = [
  {
    title: 'File Awal',
    files: [
      {
        name: 'dokumen1.pdf',
        idTku: '1234567890123456789012',
        nama: 'PT Maju Bersama Indonesia',
        faktur: '040000000000001',
        tanggal: '01-01-2025'
      },
      {
        name: 'dokumen2.pdf',
        idTku: '1234567890123456789012',
        nama: 'PT Maju Bersama Indonesia',
        faktur: '040000000000002',
        tanggal: '02-01-2025'
      },
      {
        name: 'dokumen3.pdf',
        idTku: '9876543210987654321098',
        nama: 'PT Sejahtera Karya Mandiri',
        faktur: '040000000000003',
        tanggal: '03-01-2025'
      }
    ]
  }
];

export default function ExamplesSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Contoh Penggunaan
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Lihat bagaimana Renamerged memproses file PDF Anda
          </p>
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="text-purple-400" size={24} />
              {examples[0].title}
            </h3>
            <div className="space-y-3">
              {examples[0].files.map((file, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <code className="text-purple-400 font-mono text-sm sm:text-base font-semibold">{file.name}</code>
                    </div>
                    <div className="pl-4 space-y-1 text-xs sm:text-sm">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-gray-500">ID TKU:</span>
                        <code className="text-gray-300 font-mono">{file.idTku}</code>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-gray-500">Nama:</span>
                        <span className="text-gray-300">{file.nama}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-gray-500">Nomor Faktur:</span>
                        <code className="text-gray-300 font-mono">{file.faktur}</code>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-gray-500">Tanggal:</span>
                        <span className="text-gray-300">{file.tanggal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-3 mb-4">
              <ArrowRight className="text-blue-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Mode "Rename dan Merge"
                </h3>
                <p className="text-gray-400 text-sm">File dengan ID TKU sama digabung menjadi satu</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-blue-500/20">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-sm flex-shrink-0">Input:</span>
                    <div className="flex-1">
                      <code className="text-gray-400 text-sm font-mono">dokumen1.pdf</code>
                      <span className="text-gray-600 mx-2">+</span>
                      <code className="text-gray-400 text-sm font-mono">dokumen2.pdf</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 border-t border-blue-500/20" />
                    <ArrowRight className="text-blue-500" size={16} />
                    <div className="flex-1 border-t border-blue-500/20" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-sm flex-shrink-0 font-semibold">Hasil:</span>
                      <code className="text-blue-400 text-sm font-mono font-semibold">PT Maju Bersama Indonesia.pdf</code>
                    </div>
                    <div className="flex items-start gap-2 pl-[52px]">
                      <FolderOpen className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                      <code className="text-gray-500 text-xs font-mono break-all">
                        ProcessedPDFs/1234567890123456789012/
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-blue-500/20">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-sm flex-shrink-0">Input:</span>
                    <code className="text-gray-400 text-sm font-mono">dokumen3.pdf</code>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 border-t border-blue-500/20" />
                    <ArrowRight className="text-blue-500" size={16} />
                    <div className="flex-1 border-t border-blue-500/20" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 text-sm flex-shrink-0 font-semibold">Hasil:</span>
                      <code className="text-blue-400 text-sm font-mono font-semibold">PT Sejahtera Karya Mandiri.pdf</code>
                    </div>
                    <div className="flex items-start gap-2 pl-[52px]">
                      <FolderOpen className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                      <code className="text-gray-500 text-xs font-mono break-all">
                        ProcessedPDFs/9876543210987654321098/
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-3 mb-4">
              <ArrowRight className="text-purple-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Mode "Rename Saja"
                </h3>
                <p className="text-gray-400 text-sm">Komponen: Nama Lawan Transaksi + Nomor Faktur</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { input: 'dokumen1.pdf', output: 'PT Maju Bersama Indonesia - 040000000000001.pdf', folder: '1234567890123456789012' },
                { input: 'dokumen2.pdf', output: 'PT Maju Bersama Indonesia - 040000000000002.pdf', folder: '1234567890123456789012' },
                { input: 'dokumen3.pdf', output: 'PT Sejahtera Karya Mandiri - 040000000000003.pdf', folder: '9876543210987654321098' }
              ].map((item, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 text-sm flex-shrink-0">Input:</span>
                      <code className="text-gray-400 text-sm font-mono">{item.input}</code>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <div className="flex-1 border-t border-purple-500/20" />
                      <ArrowRight className="text-purple-500" size={16} />
                      <div className="flex-1 border-t border-purple-500/20" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 text-sm flex-shrink-0 font-semibold">Hasil:</span>
                        <code className="text-purple-400 text-sm font-mono font-semibold break-all">{item.output}</code>
                      </div>
                      <div className="flex items-start gap-2 pl-[52px]">
                        <FolderOpen className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                        <code className="text-gray-500 text-xs font-mono break-all">
                          ProcessedPDFs/{item.folder}/
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-blue-400 text-sm">
              Semua file otomatis diorganisir dalam folder berdasarkan ID TKU
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
