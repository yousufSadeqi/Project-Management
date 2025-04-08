"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { debounce } from "lodash";
import Fuse from 'fuse.js';
import React, { useEffect, useState, useMemo } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'projects' | 'users'>('all');
  
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm.toLowerCase(), {
    skip: searchTerm.length < 2,
  });

  // Fuse.js configuration
  const fuseOptions = {
    keys: ['name', 'title', 'username'],
    threshold: 0.3,
    includeScore: true,
  };

  // Memoize Fuse instances
  const fuses = useMemo(() => ({
    tasks: searchResults?.tasks ? new Fuse(searchResults.tasks, fuseOptions) : null,
    projects: searchResults?.projects ? new Fuse(searchResults.projects, fuseOptions) : null,
    users: searchResults?.users ? new Fuse(searchResults.users, fuseOptions) : null,
  }), [searchResults]);

  const getFuzzyResults = () => {
    if (!searchResults) return null;
    return {
      tasks: fuses.tasks?.search(searchTerm) || [],
      projects: fuses.projects?.search(searchTerm) || [],
      users: fuses.users?.search(searchTerm) || [],
    };
  };

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    300,
  );

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch]);

  const fuzzyResults = getFuzzyResults();

  const renderResults = () => {
    if (!fuzzyResults) return null;

    const showSection = (type: 'all' | 'tasks' | 'projects' | 'users') => {
      return activeTab === 'all' || activeTab === type;
    };

    return (
      <div className="space-y-8">
        {showSection('tasks') && fuzzyResults.tasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Tasks
                <span className="ml-2 text-sm text-gray-500">({fuzzyResults.tasks.length})</span>
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fuzzyResults.tasks.map(({item}) => (
                <TaskCard key={item.id} task={item} />
              ))}
            </div>
          </div>
        )}

        {showSection('projects') && fuzzyResults.projects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Projects
                <span className="ml-2 text-sm text-gray-500">({fuzzyResults.projects.length})</span>
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fuzzyResults.projects.map(({item}) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        )}

        {showSection('users') && fuzzyResults.users.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Users
                <span className="ml-2 text-sm text-gray-500">({fuzzyResults.users.length})</span>
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fuzzyResults.users.map(({item}) => (
                <UserCard key={item.userId} user={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-dark-bg md:p-8">
      <Header name="Search" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, projects, or users..."
              className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              onChange={handleSearch}
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'tasks', 'projects', 'users'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[200px] rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          {isLoading && (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
          {isError && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-200">
              Error occurred while fetching search results.
            </div>
          )}
          {!isLoading && !isError && searchTerm.length >= 2 && renderResults()}
          {!isLoading && !isError && searchTerm.length < 2 && (
            <div className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
              <SearchIcon className="h-8 w-8 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                Start typing to search...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
