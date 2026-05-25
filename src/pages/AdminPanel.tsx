import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, User, Check, X, AlertOctagon, Terminal, Info, 
  ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Key, UploadCloud, Radio, Trash2, Save
} from 'lucide-react';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';
import { ApiClient, AdminUser, SystemLog } from '../lib/api';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'logs'>('users');
  
  // Track individual row saves
  const [editedUsers, setEditedUsers] = useState<Record<string, { role?: 'admin' | 'user'; canUpload?: boolean }>>({});
  const [rowSaving, setRowSaving] = useState<Record<string, boolean>>({});
  
  // Track delete confirmations
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Log filtering level
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  // Users Paginated Query (using custom usePaginatedQuery hook)
  const usersPageLimit = 5;
  const {
    data: users,
    setData: setUsersData,
    isLoading: usersLoading,
    error: usersError,
    hasMore: usersHasMore,
    fetchNextPage: usersFetchNext,
    refresh: usersRefresh
  } = usePaginatedQuery(ApiClient.getUsers, usersPageLimit);

  // Keep track of page offsets for cursor previous/next action tracking
  const [userPageCursorStack, setUserPageCursorStack] = useState<string[]>([]);

  // System Logs Paginated Query (using custom usePaginatedQuery hook with cursor)
  const logsPageLimit = 15; // Raised to get a richer feed
  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
    hasMore: logsHasMore,
    fetchNextPage: logsFetchNext,
    refresh: logsRefresh
  } = usePaginatedQuery(ApiClient.getLogs, logsPageLimit);

  // Action: Modify user role locally
  const handleRoleSelect = (userId: string, value: 'admin' | 'user') => {
    setEditedUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        role: value
      }
    }));
  };

  // Action: Modify upload permissions locally  
  const handleUploadToggle = (userId: string, currentVal: boolean) => {
    const edits = editedUsers[userId];
    const targetVal = edits?.canUpload !== undefined ? !edits.canUpload : !currentVal;
    
    setEditedUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        canUpload: targetVal
      }
    }));
  };

  // Action: Save dual updates to role and permissions at the same time
  const handleSaveUser = async (user: AdminUser) => {
    const edits = editedUsers[user.id];
    if (!edits) return;

    setRowSaving(prev => ({ ...prev, [user.id]: true }));
    try {
      // 1. Update role if modified
      if (edits.role !== undefined && edits.role !== user.role) {
        await ApiClient.updateUserRole(user.id, edits.role);
      }
      
      // 2. Update upload permissions if modified
      if (edits.canUpload !== undefined && edits.canUpload !== user.permissions.canUpload) {
        await ApiClient.updateUploadPermission(user.id, edits.canUpload);
      }

      // 3. Commit state changes of local cache
      setUsersData(prev => prev.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            role: edits.role !== undefined ? edits.role : u.role,
            permissions: {
              ...u.permissions,
              canUpload: edits.canUpload !== undefined ? edits.canUpload : u.permissions.canUpload
            }
          };
        }
        return u;
      }));

      // 4. Wipe pending edits for this user row
      setEditedUsers(prev => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    } catch (err: any) {
      alert('حدث خطأ أثناء حفظ التعديلات: ' + (err.message || err));
    } finally {
      setRowSaving(prev => ({ ...prev, [user.id]: false }));
    }
  };

  // Action: Handle final permanent removal
  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      await ApiClient.deleteUser(userId);
      setUsersData(prev => prev.filter(u => u.id !== userId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert('فشل حذف حساب المستخدم: ' + (err.message || err));
    } finally {
      setDeletingId(null);
    }
  };

  // Determine filtered logs for the UI
  const filteredLogs = logs.filter(log => {
    if (logLevelFilter === 'all') return true;
    return log.level === logLevelFilter;
  });

  return (
    <div className="min-h-screen bg-surface pb-32 pt-6 px-4 max-w-4xl mx-auto">
      {/* Top Bar with Elegant Actions */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white text-secondary rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="scale-x-[-1]" />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-secondary leading-tight flex items-center gap-2 justify-end">
              <span>لوحة التحكم والإدارة</span>
              <Shield className="text-primary" size={24} />
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rafid Administrative Framework</p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (activeSubTab === 'users') usersRefresh();
            else logsRefresh();
          }}
          className="p-3 bg-primary/5 text-primary border border-primary/10 rounded-2xl hover:bg-primary/10 transition-all active:scale-95 flex items-center gap-2 text-xs font-black tracking-widest uppercase"
        >
          <RefreshCw size={14} className={usersLoading || logsLoading ? 'animate-spin' : ''} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Structured Status / Metadata Bar */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`p-6 rounded-[2.25rem] border-2 text-right transition-all flex items-center justify-between ${
            activeSubTab === 'users'
              ? 'bg-secondary text-white border-secondary shadow-lg'
              : 'bg-white text-gray-400 border-gray-50 hover:border-primary/20'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-1">قائمة وإدارة المستخدمين</span>
            <span className="text-xl font-black">أعضاء المنصة</span>
          </div>
          <User size={28} className={activeSubTab === 'users' ? 'text-primary' : 'text-gray-300'} />
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`p-6 rounded-[2.25rem] border-2 text-right transition-all flex items-center justify-between ${
            activeSubTab === 'logs'
              ? 'bg-secondary text-white border-secondary shadow-lg'
              : 'bg-white text-gray-400 border-gray-50 hover:border-primary/20'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-1 font-sans">سجلات ومقاييس النظام</span>
            <span className="text-xl font-black">تتبع الأخطاء والعمليات</span>
          </div>
          <Terminal size={28} className={activeSubTab === 'logs' ? 'text-primary' : 'text-gray-300'} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'users' ? (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-right"
            dir="rtl"
          >
            {/* User List Table */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-base text-secondary">إدارة أدوار وصلاحيات الأعضاء</h3>
                  <p className="text-[10px] font-bold text-gray-400">تغيير الرتب، تعليق صلاحيات الرفع والمشاركة، أو حذف الأعضاء</p>
                </div>
                <div className="px-3 py-1 bg-surface text-secondary text-[10px] font-black rounded-lg">
                  رقم الصفحة: {userPageCursorStack.length + 1}
                </div>
              </div>

              {usersError && (
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-2 text-xs font-bold my-4 leading-relaxed border border-red-100">
                  <AlertOctagon size={16} />
                  <span>{usersError.message}</span>
                </div>
              )}

              {usersLoading && users.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-gray-400">جاري تحميل سجلات المستخدمين...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right" dir="rtl">
                    <thead>
                      <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="pb-4 pr-2 text-right">المستخدم والبريد الإلكتروني</th>
                        <th className="pb-4 text-right">الرتبة والدور</th>
                        <th className="pb-4 text-center">صلاحية الرفع</th>
                        <th className="pb-4 pl-2 text-left">إجراءات الحفظ والإدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((user) => {
                        const edits = editedUsers[user.id];
                        const displayRole = edits?.role !== undefined ? edits.role : user.role;
                        const displayCanUpload = edits?.canUpload !== undefined ? edits.canUpload : user.permissions.canUpload;
                        
                        const isModified = (edits?.role !== undefined && edits.role !== user.role) || 
                                           (edits?.canUpload !== undefined && edits.canUpload !== user.permissions.canUpload);
                        
                        const isSaving = rowSaving[user.id];

                        return (
                          <tr key={user.id} className="text-xs font-bold text-gray-600 hover:bg-surface/50 transition-colors">
                            <td className="py-4 pr-2 font-black text-secondary">
                              <span className="block">{user.email}</span>
                              <span className="text-[9px] font-bold text-gray-300 block mt-0.5">انضم: {new Date(user.created_at).toLocaleDateString('ar-IQ')}</span>
                            </td>
                            
                            <td className="py-4">
                              <select
                                value={displayRole}
                                onChange={(e) => handleRoleSelect(user.id, e.target.value as any)}
                                className={`bg-surface border border-gray-100 rounded-xl px-2 py-1 focus:border-primary outline-none font-black text-[11px] ${
                                  displayRole === 'admin' ? 'text-red-500 bg-red-50/50' : 'text-secondary'
                                }`}
                              >
                                <option value="user">مستعمل عادي (User)</option>
                                <option value="admin">مدير مشرف (Admin)</option>
                              </select>
                            </td>

                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleUploadToggle(user.id, user.permissions.canUpload)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider inline-flex items-center gap-1.5 transition-all outline-none ${
                                  displayCanUpload
                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                    : 'bg-red-50 text-red-500 border border-red-100'
                                }`}
                              >
                                {displayCanUpload ? <Check size={12} /> : <X size={12} />}
                                <span>{displayCanUpload ? 'مسموح' : 'محظور'}</span>
                              </button>
                            </td>

                            <td className="py-4 pl-2 text-left">
                              <div className="flex items-center gap-2 justify-end">
                                {isModified && (
                                  <button
                                    onClick={() => handleSaveUser(user)}
                                    disabled={isSaving}
                                    className="px-3.5 py-1.5 bg-green-500 text-white rounded-xl hover:bg-green-600 font-black text-[10px] transition-all flex items-center gap-1 shadow-md shadow-green-500/10 disabled:opacity-50"
                                    title="حفظ التعديلات المعلقة"
                                  >
                                    {isSaving ? (
                                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Save size={12} />
                                    )}
                                    <span>حفظ</span>
                                  </button>
                                )}

                                {deleteConfirmId === user.id ? (
                                  <div className="flex items-center gap-1 bg-red-50 border border-red-100 p-0.5 rounded-xl animate-pulse">
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      disabled={deletingId === user.id}
                                      className="px-2.5 py-1 bg-red-500 text-white rounded-lg font-black text-[9px] hover:bg-red-600 transition-colors"
                                    >
                                      {deletingId === user.id ? '...' : 'تأكيد الحذف'}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-2 py-1 bg-white border border-gray-100 text-gray-500 rounded-lg text-[9px] font-bold hover:bg-gray-50"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(user.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="حذف هذا الحساب نهائياً"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {users.length === 0 && (
                    <div className="py-12 text-center text-gray-400">
                      لا يوجد مستخدمون لعرضهم حالياً
                    </div>
                  )}

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
                    <button
                      onClick={() => {
                        // Go back to previous page
                        const stack = [...userPageCursorStack];
                        stack.pop(); // Remove current cursor
                        setUserPageCursorStack(stack);
                        const prevCursor = stack[stack.length - 1]; // Get prior cursor
                        
                        ApiClient.getUsers(prevCursor, usersPageLimit).then(res => {
                          setUsersData(res.data);
                        });
                      }}
                      disabled={userPageCursorStack.length === 0}
                      className="px-5 py-2.5 bg-white border border-gray-100 text-secondary rounded-2xl hover:bg-surface text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-30 shadow-sm"
                    >
                      <ChevronRight size={14} />
                      <span>السابق</span>
                    </button>

                    <button
                      onClick={() => {
                        if (usersHasMore) {
                          const nextCursor = String(users.length + (userPageCursorStack.length * usersPageLimit));
                          setUserPageCursorStack(prev => [...prev, nextCursor]);
                          
                          ApiClient.getUsers(nextCursor, usersPageLimit).then(res => {
                            setUsersData(res.data);
                          });
                        }
                      }}
                      disabled={!usersHasMore}
                      className="px-5 py-2.5 bg-white border border-gray-100 text-secondary rounded-2xl hover:bg-surface text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-30 shadow-sm"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="logs-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-right"
            dir="rtl"
          >
            {/* System logs renderer */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
                <div>
                  <h3 className="font-black text-base text-secondary">سجلات ومخرجات خادم Rafid</h3>
                  <p className="text-[10px] font-bold text-gray-400">رصد مستمر للطلبات الواردة، معاملات استعادة كلمّ المرور، والأعطال البرمجية</p>
                </div>
                
                {/* Advanced Level Filters */}
                <div className="flex bg-surface p-1 rounded-2xl gap-1 w-full md:w-auto overflow-x-auto select-none border border-gray-100">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'info', label: 'معلومات' },
                    { id: 'warn', label: 'تحذيرات' },
                    { id: 'error', label: 'أخطاء' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setLogLevelFilter(item.id as any)}
                      className={`py-1.5 px-3.5 text-[10px] font-black rounded-lg transition-all whitespace-nowrap ${
                        logLevelFilter === item.id
                          ? 'bg-secondary text-white shadow-sm'
                          : 'text-gray-400 hover:text-secondary hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {logsError && (
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-2 text-xs font-bold my-4 border border-red-100">
                  <AlertOctagon size={16} />
                  <span>{logsError.message}</span>
                </div>
              )}

              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-5 rounded-[1.5rem] border border-gray-50 hover:bg-surface/35 transition-colors flex flex-col gap-3 font-mono text-right"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                          log.level === 'error'
                            ? 'bg-red-50 text-red-500 border border-red-100 font-sans'
                            : log.level === 'warn'
                            ? 'bg-orange-50 text-orange-600 border border-orange-100 font-sans'
                            : 'bg-blue-50 text-blue-500 border border-blue-100 font-sans'
                        }`}>
                          {log.level.toUpperCase()}
                        </span>
                        
                        <span className="text-secondary text-xs font-bold inline-flex items-center gap-1 text-right">
                          <Radio size={12} className="text-secondary opacity-40 animate-pulse shrink-0" />
                          <span>{log.message}</span>
                        </span>
                      </div>

                      <span className="text-[10px] text-gray-300 font-sans">
                        {new Date(log.timestamp).toLocaleTimeString('ar-IQ')} - {new Date(log.timestamp).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="bg-surface/50 p-4 rounded-xl text-[10px] text-gray-500 space-y-1 border border-gray-100 overflow-x-auto select-all text-left">
                        <span className="block font-black text-secondary tracking-widest uppercase mb-1 font-sans text-right" dir="rtl">حمولة البيانات (METADATA)</span>
                        <pre className="text-xs leading-relaxed text-left font-mono" dir="ltr">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}

                {logsLoading && (
                  <div className="py-6 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!logsLoading && logsHasMore && (
                  <button
                    onClick={() => logsFetchNext(false)}
                    className="w-full py-4 text-center text-xs font-black text-gray-400 hover:text-secondary hover:bg-surface rounded-2xl border border-dashed border-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={12} />
                    <span>تحميل المزيد من السجلات</span>
                  </button>
                )}

                {!logsHasMore && filteredLogs.length > 0 && (
                  <p className="text-center font-bold text-gray-300 text-[10px] pt-4">وصلت إلى نهاية السجلات المتاحة</p>
                )}

                {filteredLogs.length === 0 && !logsLoading && (
                  <div className="py-12 text-center text-gray-400 font-sans font-bold">
                    لا تشمل التصفية الحالية أي سجلات مطابقة
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
