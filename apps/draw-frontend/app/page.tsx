

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       Landing Page
//     </div>
//   );
// }


import { Pencil, Users, Zap, Download, Lock, Layers, ArrowRight, Github } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Pencil className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DrawBoard</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <button className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors">Sign In</button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden bg-lineat-to-br from-blue-50 via-white to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
                Draw, Collaborate,
                <span className="block text-blue-600">Create Together</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
                A powerful, intuitive whiteboard tool for sketching diagrams, wireframes, and ideas.
                Real-time collaboration made simple and beautiful.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center">
                  Start Drawing Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200 text-lg font-semibold flex items-center justify-center">
                  <Github className="mr-2 w-5 h-5" />
                  View on GitHub
                </button>
              </div>
            </div>

            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-600 font-medium">DrawBoard Canvas</div>
                </div>
                <div className="aspect-video bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-8 p-12">
                    <div className="w-24 h-24 bg-blue-200 rounded-lg shadow-md transform -rotate-6"></div>
                    <div className="w-24 h-24 bg-cyan-200 rounded-full shadow-md transform rotate-12"></div>
                    <div className="w-24 h-24 bg-teal-200 shadow-md transform -rotate-3" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                    <div className="col-span-2 h-16 bg-blue-300 rounded-lg shadow-md transform rotate-2"></div>
                    <div className="w-24 h-24 bg-cyan-300 rounded-lg shadow-md transform rotate-6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to create</h2>
              <p className="text-xl text-gray-600">Powerful features designed for seamless collaboration</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Pencil className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Intuitive Drawing</h3>
                <p className="text-gray-600">Sketch freely with a natural drawing experience. Create rectangles, circles, arrows, and freehand drawings effortlessly.</p>
              </div>

              <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition-colors">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
                <p className="text-gray-600">Work together with your team in real-time. See cursors, edits, and changes as they happen.</p>
              </div>

              <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Built for speed with no lag. Smooth performance even with complex diagrams and multiple collaborators.</p>
              </div>

              <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Anywhere</h3>
                <p className="text-gray-600">Export your drawings as PNG, SVG, or share a link. Your work, your way.</p>
              </div>

              <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition-colors">
                  <Lock className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-600">Your data stays secure. End-to-end encryption ensures your ideas remain private.</p>
              </div>

              <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <Layers className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Infinite Canvas</h3>
                <p className="text-gray-600">Never run out of space. Pan and zoom through an unlimited canvas for your biggest ideas.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-24 bg-linear-to-br from-blue-50 to-cyan-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to start creating?</h2>
            <p className="text-xl text-gray-600 mb-10">
              Join thousands of designers, developers, and teams who use DrawBoard to bring their ideas to life.
            </p>
            <button className="group px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold inline-flex items-center">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Pencil className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-white">DrawBoard</span>
            </div>
            <div className="text-sm">
              © 2024 DrawBoard. Built with care for creators everywhere.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
