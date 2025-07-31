import React, { useState } from 'react';
import { X, User, Mail, Brain, Sparkles, Settings, Bell, Shield, BookOpen, Target, Zap, Globe, Edit3, Save, Camera } from 'lucide-react';

const AccountModal = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@pearadox.com',
    title: 'AI Research Scientist',
    institution: 'Stanford University',
    researchInterests: ['Machine Learning', 'Quantum Computing', 'Neural Networks'],
    aiPreferences: {
      summaryStyle: 'detailed',
      notificationFrequency: 'daily',
      researchLevel: 'expert'
    },
    achievements: {
      articlesRead: 247,
      papersSaved: 89,
      researchHours: 156,
      insightsGenerated: 42
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'research', label: 'Research Hub', icon: Brain },
    { id: 'preferences', label: 'AI Preferences', icon: Settings },
    { id: 'achievements', label: 'Achievements', icon: Target }
  ];

  const researchInterests = [
    'Machine Learning', 'Quantum Computing', 'Neural Networks', 'Computer Vision',
    'Natural Language Processing', 'Robotics', 'Bioinformatics', 'Edge Computing'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] flex">
        {/* Sidebar */}
        <div className="w-80 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-l-3xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Account Hub</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Profile Summary */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  SC
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{userData.name}</h3>
              <p className="text-white/70 text-sm mb-2">{userData.title}</p>
              <p className="text-white/50 text-xs">{userData.institution}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white shadow-lg border border-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white/95 backdrop-blur-xl border border-white/20 rounded-r-3xl">
          <div className="h-full overflow-y-auto p-8">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Profile Settings
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
                      isEditing
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-500" />
                      Basic Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={userData.name}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={userData.email}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                        <input
                          type="text"
                          value={userData.title}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={userData.institution}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Research Interests */}
                  <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-500" />
                      Research Interests
                    </h4>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Select your areas of research interest</p>
                      <div className="flex flex-wrap gap-2">
                        {researchInterests.map(interest => (
                          <button
                            key={interest}
                            disabled={!isEditing}
                            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              userData.researchInterests.includes(interest)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } ${!isEditing ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Research Hub Tab */}
            {activeTab === 'research' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                  Research Dashboard
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(userData.achievements).map(([key, value]) => {
                    const icons = {
                      articlesRead: BookOpen,
                      papersSaved: Sparkles,
                      researchHours: Zap,
                      insightsGenerated: Brain
                    };
                    const Icon = icons[key];
                    const labels = {
                      articlesRead: 'Articles Read',
                      papersSaved: 'Papers Saved',
                      researchHours: 'Research Hours',
                      insightsGenerated: 'AI Insights'
                    };

                    return (
                      <div key={key} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                          <div className="text-sm text-gray-600 font-medium">{labels[key]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {[
                      { action: 'Read paper on Quantum Machine Learning', time: '2 hours ago', icon: BookOpen },
                      { action: 'Saved research on Neural Network Optimization', time: '5 hours ago', icon: Sparkles },
                      { action: 'Generated AI summary for Computer Vision paper', time: '1 day ago', icon: Brain },
                      { action: 'Completed weekly research goal', time: '2 days ago', icon: Target }
                    ].map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl">
                          <Icon className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-900 bg-clip-text text-transparent">
                  AI Preferences
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-green-500" />
                      AI Assistant Settings
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Summary Style</label>
                        <div className="space-y-2">
                          {['brief', 'detailed', 'technical'].map(style => (
                            <label key={style} className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl cursor-pointer hover:bg-white/60 transition-colors">
                              <input
                                type="radio"
                                name="summaryStyle"
                                value={style}
                                checked={userData.aiPreferences.summaryStyle === style}
                                className="text-blue-500 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-900 capitalize">{style}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Research Level</label>
                        <select className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert" selected>Expert</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-yellow-500" />
                      Notifications
                    </h4>
                    <div className="space-y-4">
                      {[
                        { label: 'New research alerts', checked: true },
                        { label: 'AI-generated insights', checked: true },
                        { label: 'Weekly research digest', checked: false },
                        { label: 'Trending papers', checked: true },
                        { label: 'Collaboration invites', checked: false }
                      ].map((setting, index) => (
                        <label key={index} className="flex items-center justify-between p-3 bg-white/40 rounded-xl cursor-pointer hover:bg-white/60 transition-colors">
                          <span className="text-sm font-medium text-gray-900">{setting.label}</span>
                          <div className={`w-12 h-6 rounded-full transition-colors ${setting.checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${setting.checked ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-yellow-900 bg-clip-text text-transparent">
                  Research Achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Research Pioneer', description: 'Read 100+ research papers', icon: BookOpen, earned: true },
                    { title: 'Knowledge Curator', description: 'Saved 50+ papers to library', icon: Sparkles, earned: true },
                    { title: 'AI Collaborator', description: 'Generated 25+ AI insights', icon: Brain, earned: true },
                    { title: 'Domain Expert', description: 'Specialized in 3+ research areas', icon: Target, earned: false },
                    { title: 'Research Marathon', description: 'Spent 200+ hours researching', icon: Zap, earned: false },
                    { title: 'Global Scholar', description: 'Explored papers from 10+ countries', icon: Globe, earned: false }
                  ].map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className={`relative ${achievement.earned ? '' : 'opacity-60'}`}>
                        <div className={`absolute inset-0 rounded-2xl blur-lg ${achievement.earned ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20' : 'bg-gray-200/20'}`}></div>
                        <div className={`relative border rounded-2xl p-6 text-center ${achievement.earned ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white/60 border-gray-200'}`}>
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${achievement.earned ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-300'}`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.earned && (
                            <div className="mt-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                ✓ Earned
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal; 