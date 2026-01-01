
import React, { useState, useEffect } from 'react';
import { Users, Shield, Flag, Trash2, CheckCircle, XCircle, Search, AlertCircle, FileText, LogOut, Home, Video, Check, X, Eye, MapPin, Briefcase, Smartphone, Mail, Calendar, Ban } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'verification' | 'reports'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for viewing user profile modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Reports Data State
  const [reports, setReports] = useState([
    { id: 1, reporter: 'Sadia Islam', reported: 'Kamal Hasan', reason: 'Fake Profile', date: '2023-11-15', status: 'Pending' },
    { id: 2, reporter: 'Nusrat Jahan', reported: 'Rahim Uddin', reason: 'Harassment', date: '2023-11-14', status: 'Resolved' },
    { id: 3, reporter: 'Tanvir Ahmed', reported: 'Fatima Begum', reason: 'Spamming', date: '2023-11-16', status: 'Pending' },
  ]);

  useEffect(() => {
    // Load users from local storage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে মুছে ফেলতে চান? এটি ফিরিয়ে আনা যাবে না।')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // If the deleted user is currently being viewed, close the modal
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      
      alert('ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।');
    }
  };

  const handleVerifyUser = (userId: string, type: 'id' | 'video', status: boolean) => {
    // Confirmation for rejection
    if (!status && !window.confirm('আপনি কি নিশ্চিত যে আপনি এটি প্রত্যাখ্যান করতে চান? ব্যবহারকারীকে আবার ডকুমেন্ট আপলোড করতে হবে।')) {
        return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (type === 'id') {
            return { 
                ...u, 
                isIdVerified: status,
                idDocument: status ? u.idDocument : undefined // Keep doc if verified, clear if rejected
            };
        }
        if (type === 'video') {
            return { 
                ...u, 
                isVideoVerified: status,
                verificationVideo: status ? u.verificationVideo : undefined // Keep video if verified, clear if rejected
            };
        }
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update selected user view if open
    if (selectedUser?.id === userId) {
        const updatedUser = updatedUsers.find(u => u.id === userId);
        if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleReportAction = (reportId: number, action: 'resolve' | 'dismiss' | 'ban') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'ban') {
       if (window.confirm(`আপনি কি নিশ্চিত যে আপনি ${report.reported}-কে ব্যান করতে চান? এটি ব্যবহারকারীকে মুছে ফেলবে এবং রিপোর্টটি সমাধান করবে।`)) {
           // Try to find user by name (Note: In a real app, reports would have user IDs)
           const userToBan = users.find(u => u.fullName === report.reported);
           if (userToBan) {
               handleDeleteUser(userToBan.id); 
           } else {
               alert('সতর্কতা: ব্যবহারকারী ডাটাবেসে পাওয়া যায়নি (হয়তো ইতোমধ্যে মুছে ফেলা হয়েছে), তবে রিপোর্টটি সমাধান হিসেবে চিহ্নিত করা হচ্ছে।');
           }
           // Update report status to Resolved after action
           setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Resolved' } : r));
       }
       return;
    }

    const newStatus = action === 'resolve' ? 'Resolved' : 'Dismissed';
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

  const pendingVerifications = users.filter(u => (u.idDocument && !u.isIdVerified) || (u.verificationVideo && !u.isVideoVerified));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-dark text-white p-4 flex-shrink-0 flex flex-col">
        <div className="mb-8 p-4 text-center border-b border-gray-700">
          <h2 className="text-xl font-bold">এডমিন প্যানেল</h2>
          <p className="text-gray-400 text-sm">First Sight</p>
        </div>
        
        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            <div className="grid place-items-center w-5"><div className="w-5 h-5 border-2 border-current rounded grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-current"></div><div className="bg-current"></div><div className="bg-current"></div><div className="bg-current"></div></div></div>
            <span>ড্যাশবোর্ড</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            <Users size={20} />
            <span>ব্যবহারকারী</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('verification')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'verification' ? 'bg-primary text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            <Shield size={20} />
            <div className="flex justify-between w-full items-center">
              <span>ভেরিফিকেশন</span>
              {pendingVerifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingVerifications.length}</span>
              )}
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-primary text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            <Flag size={20} />
            <div className="flex justify-between w-full items-center">
                <span>রিপোর্টস</span>
                {reports.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{reports.filter(r => r.status === 'Pending').length}</span>
                )}
            </div>
          </button>
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-700 space-y-2">
            <button 
              onClick={() => onNavigate('home')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors"
            >
              <Home size={20} />
              <span>হোম পেজ</span>
            </button>
            <button 
              onClick={() => { logout(); onNavigate('home'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/30 text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span>লগ আউট</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ওভারভিউ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">মোট ব্যবহারকারী</p>
                    <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Users size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">পেন্ডিং ভেরিফিকেশন</p>
                    <h3 className="text-3xl font-bold text-gray-800">{pendingVerifications.length}</h3>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-full text-yellow-500">
                    <Shield size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">সফল ম্যাচ</p>
                    <h3 className="text-3xl font-bold text-gray-800">124</h3>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-full text-green-500">
                    <CheckCircle size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">পেন্ডিং রিপোর্ট</p>
                    <h3 className="text-3xl font-bold text-gray-800">{reports.filter(r => r.status === 'Pending').length}</h3>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-full text-red-500">
                    <Flag size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Mock */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">সাম্প্রতিক অ্যাক্টিভিটি</h3>
              <div className="space-y-4">
                {users.slice(-3).reverse().map((u, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                       {u.profilePhoto ? <img src={u.profilePhoto} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{u.fullName[0]}</div>}
                     </div>
                     <div>
                       <p className="font-medium text-gray-800"><span className="font-bold">{u.fullName}</span> নতুন অ্যাকাউন্ট তৈরি করেছেন</p>
                       <p className="text-xs text-gray-500">১ ঘণ্টা আগে</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-800">ব্যবহারকারী ম্যানেজমেন্ট</h2>
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="খুঁজুন (নাম, ইমেইল)..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                 />
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-semibold text-gray-600">নাম</th>
                      <th className="p-4 font-semibold text-gray-600">ইমেইল</th>
                      <th className="p-4 font-semibold text-gray-600">ফোন</th>
                      <th className="p-4 font-semibold text-gray-600">স্ট্যাটাস</th>
                      <th className="p-4 font-semibold text-gray-600 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                             {u.profilePhoto ? <img src={u.profilePhoto} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-500">{u.fullName[0]}</div>}
                          </div>
                          <div>
                            <div className="font-medium">{u.fullName}</div>
                            <div className="text-xs text-gray-500">ID: {u.id}</div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{u.email}</td>
                        <td className="p-4 text-gray-600 text-sm">{u.phone}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                             {u.isIdVerified && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">ID Verified</span>}
                             {u.isVideoVerified && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">Video Verified</span>}
                             {!u.isIdVerified && !u.isVideoVerified && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] border border-gray-200">Unverified</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setSelectedUser(u)}
                              className="text-primary hover:text-primary-dark p-2 hover:bg-primary/10 rounded-full transition-colors"
                              title="প্রোফাইল দেখুন"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">কোনো ব্যবহারকারী পাওয়া যায়নি</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verification Center */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ভেরিফিকেশন অনুরোধ</h2>
            
            {pendingVerifications.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center shadow-sm">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">সব ক্লিয়ার!</h3>
                <p className="text-gray-500 mt-2">বর্তমানে কোনো পেন্ডিং ভেরিফিকেশন অনুরোধ নেই।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingVerifications.map(u => (
                  <div key={u.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                           {u.profilePhoto ? <img src={u.profilePhoto} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{u.fullName[0]}</div>}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{u.fullName}</h3>
                          <div className="flex gap-2 text-sm text-gray-500">
                             <span>{u.email}</span>
                             <span>•</span>
                             <span>{u.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                           onClick={() => setSelectedUser(u)}
                           className="text-sm bg-gray-100 hover:bg-gray-200 text-dark px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                        >
                           <Eye size={14} /> প্রোফাইল দেখুন
                        </button>
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID: {u.id}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* ID Document Check */}
                      {u.idDocument && !u.isIdVerified && (
                         <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FileText size={18} /> সরকারি আইডি ডকুমেন্ট</h4>
                            <div className="h-56 bg-white rounded border border-gray-200 mb-4 overflow-hidden flex items-center justify-center relative group">
                               {u.idDocument.startsWith('data:image') ? (
                                  <>
                                    <img src={u.idDocument} alt="ID" className="max-h-full max-w-full object-contain" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <button 
                                         onClick={() => {
                                             const win = window.open();
                                             if(win) win.document.write(`<img src="${u.idDocument}" style="max-width:100%; display:block; margin:auto;" />`);
                                         }}
                                         className="bg-white text-dark px-4 py-2 rounded-full text-sm font-bold"
                                       >
                                         ফুল ভিউ
                                       </button>
                                    </div>
                                  </>
                               ) : (
                                  <div className="text-gray-500 flex flex-col items-center">
                                    <FileText size={32} />
                                    <span className="text-xs mt-2">ডকুমেন্ট প্রিভিউ</span>
                                  </div>
                               )}
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleVerifyUser(u.id, 'id', true)}
                                 className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <Check size={18} />
                                 অনুমোদন
                               </button>
                               <button 
                                 onClick={() => handleVerifyUser(u.id, 'id', false)}
                                 className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <X size={18} />
                                 প্রত্যাখ্যান
                               </button>
                            </div>
                         </div>
                      )}
                      
                      {/* Video Check */}
                      {u.verificationVideo && !u.isVideoVerified && (
                         <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Shield size={18} /> ভিডিও সেলফি</h4>
                            <div className="h-56 bg-black rounded mb-4 flex items-center justify-center overflow-hidden">
                                {u.verificationVideo.startsWith('data:video') || u.verificationVideo.startsWith('http') ? (
                                    <video controls className="w-full h-full object-contain">
                                        <source src={u.verificationVideo} type="video/mp4" />
                                        <source src={u.verificationVideo} type="video/webm" />
                                        আপনার ব্রাউজার ভিডিও ট্যাগ সমর্থন করে না।
                                    </video>
                                ) : (
                                    <div className="text-white text-center">
                                        <p>ভিডিও লোড করা যাচ্ছে না</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleVerifyUser(u.id, 'video', true)}
                                 className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <Check size={18} />
                                 অনুমোদন
                               </button>
                               <button 
                                 onClick={() => handleVerifyUser(u.id, 'video', false)}
                                 className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <X size={18} />
                                 প্রত্যাখ্যান
                               </button>
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Section */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ব্যবহারকারী রিপোর্ট</h2>
             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">রিপোর্টার</th>
                    <th className="p-4 font-semibold text-gray-600">অভিযুক্ত</th>
                    <th className="p-4 font-semibold text-gray-600">কারণ</th>
                    <th className="p-4 font-semibold text-gray-600">তারিখ</th>
                    <th className="p-4 font-semibold text-gray-600">স্ট্যাটাস</th>
                    <th className="p-4 font-semibold text-gray-600">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-800 font-medium">{r.reporter}</td>
                      <td className="p-4 text-red-600 font-medium">{r.reported}</td>
                      <td className="p-4 text-gray-600">{r.reason}</td>
                      <td className="p-4 text-gray-500 text-sm">{r.date}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'Resolved' ? 'bg-green-100 text-green-700' : (r.status === 'Dismissed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700')}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                           {r.status === 'Pending' && (
                               <>
                                   <button 
                                     onClick={() => handleReportAction(r.id, 'resolve')} 
                                     className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold hover:bg-green-200 transition-colors border border-green-200"
                                     title="সমাধান করুন"
                                   >
                                     <Check size={12} /> Resolve
                                   </button>
                                   <button 
                                     onClick={() => handleReportAction(r.id, 'dismiss')} 
                                     className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                                     title="খারিজ করুন"
                                   >
                                     <X size={12} /> Dismiss
                                   </button>
                               </>
                           )}
                           <button 
                             onClick={() => handleReportAction(r.id, 'ban')} 
                             className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold hover:bg-red-200 transition-colors border border-red-200"
                             title="ব্যবহারকারীকে ব্যান করুন"
                           >
                             <Ban size={12} /> Ban
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                      <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">কোনো রিপোর্ট পাওয়া যায়নি</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Admin Profile View Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in fade-in duration-200">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              {/* Cover Photo */}
              <div className="h-48 md:h-64 bg-gray-200 w-full relative">
                 {selectedUser.coverPhoto ? (
                    <img src={selectedUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                       <FileText size={48} />
                    </div>
                 )}
                 <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Admin View Mode
                 </div>
              </div>

              <div className="px-8 pb-8">
                 <div className="flex flex-col md:flex-row items-end -mt-16 md:-mt-20 mb-6 gap-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
                       {selectedUser.profilePhoto ? (
                          <img src={selectedUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <Users size={40} />
                          </div>
                       )}
                    </div>
                    <div className="flex-1">
                       <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                          {selectedUser.fullName}
                          {selectedUser.isIdVerified && <CheckCircle className="text-green-500" size={24} />}
                       </h2>
                       <p className="text-gray-600">{selectedUser.occupation || 'N/A'} • {selectedUser.location || 'N/A'}</p>
                       <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedUser.isIdVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                             {selectedUser.isIdVerified ? 'ID Verified' : 'ID Unverified'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedUser.isVideoVerified ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                             {selectedUser.isVideoVerified ? 'Video Verified' : 'Video Unverified'}
                          </span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleDeleteUser(selectedUser.id)}
                         className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                       >
                          <Trash2 size={18} /> মুছে ফেলুন
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Info */}
                    <div className="space-y-6">
                       <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} /> ব্যক্তিগত তথ্য</h3>
                          <div className="space-y-3">
                             <div className="grid grid-cols-3 text-sm">
                                <span className="text-gray-500">বয়স</span>
                                <span className="col-span-2 font-medium">{selectedUser.age} বছর</span>
                             </div>
                             <div className="grid grid-cols-3 text-sm">
                                <span className="text-gray-500">লিঙ্গ</span>
                                <span className="col-span-2 font-medium capitalize">{selectedUser.gender}</span>
                             </div>
                             <div className="grid grid-cols-3 text-sm">
                                <span className="text-gray-500">ধর্ম</span>
                                <span className="col-span-2 font-medium capitalize">{selectedUser.religion}</span>
                             </div>
                             <div className="grid grid-cols-3 text-sm">
                                <span className="text-gray-500">বায়ো</span>
                                <span className="col-span-2 text-gray-700">{selectedUser.bio || '-'}</span>
                             </div>
                          </div>
                       </div>

                       <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Smartphone size={18} /> যোগাযোগ (Admin Access)</h3>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full text-blue-500 shadow-sm"><Mail size={16} /></div>
                                <div>
                                   <p className="text-xs text-gray-500">ইমেইল</p>
                                   <p className="font-medium text-gray-800">{selectedUser.email}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full text-green-500 shadow-sm"><Smartphone size={16} /></div>
                                <div>
                                   <p className="text-xs text-gray-500">ফোন</p>
                                   <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-800">{selectedUser.phone}</p>
                                      {selectedUser.isPhoneVerified && <CheckCircle size={14} className="text-green-500" />}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Verification Documents View */}
                    <div className="space-y-6">
                       <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Shield size={18} /> ভেরিফিকেশন ডকুমেন্ট</h3>
                          
                          <div className="space-y-4">
                             <div>
                                <div className="flex justify-between items-center mb-2">
                                   <p className="text-sm font-medium text-gray-600">সরকারি আইডি</p>
                                   {selectedUser.isIdVerified ? (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified</span>
                                   ) : selectedUser.idDocument ? (
                                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pending Review</span>
                                   ) : (
                                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Not Uploaded</span>
                                   )}
                                </div>
                                {selectedUser.idDocument ? (
                                   <div className="h-40 bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                                      <img src={selectedUser.idDocument} alt="ID" className="max-h-full max-w-full object-contain" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <button 
                                           onClick={() => {
                                              const win = window.open();
                                              if(win) win.document.write(`<img src="${selectedUser.idDocument}" style="max-width:100%; display:block; margin:auto;" />`);
                                           }}
                                           className="bg-white text-dark p-2 rounded-full" title="View Full"
                                         >
                                            <Eye size={16} />
                                         </button>
                                         {!selectedUser.isIdVerified && (
                                            <button 
                                              onClick={() => handleVerifyUser(selectedUser.id, 'id', true)}
                                              className="bg-green-500 text-white p-2 rounded-full" title="Approve"
                                            >
                                               <Check size={16} />
                                            </button>
                                         )}
                                      </div>
                                   </div>
                                ) : (
                                   <div className="h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                      No Document
                                   </div>
                                )}
                             </div>

                             <div>
                                <div className="flex justify-between items-center mb-2">
                                   <p className="text-sm font-medium text-gray-600">ভিডিও সেলফি</p>
                                   {selectedUser.isVideoVerified ? (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified</span>
                                   ) : selectedUser.verificationVideo ? (
                                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pending Review</span>
                                   ) : (
                                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Not Uploaded</span>
                                   )}
                                </div>
                                {selectedUser.verificationVideo ? (
                                   <div className="h-40 bg-black rounded border border-gray-200 overflow-hidden flex items-center justify-center relative">
                                       <video controls className="max-h-full max-w-full">
                                          <source src={selectedUser.verificationVideo} />
                                       </video>
                                       {!selectedUser.isVideoVerified && (
                                          <div className="absolute top-2 right-2 flex gap-2">
                                             <button 
                                                onClick={() => handleVerifyUser(selectedUser.id, 'video', true)}
                                                className="bg-green-500 text-white p-1.5 rounded shadow-sm" title="Approve"
                                             >
                                                <Check size={14} />
                                             </button>
                                          </div>
                                       )}
                                   </div>
                                ) : (
                                   <div className="h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                      No Video
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
