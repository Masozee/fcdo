"use client"

import React from 'react';
import Image from 'next/image';
import * as Avatar from '@radix-ui/react-avatar';

// Team member data
const teamMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'Chief Economist',
    bio: 'Dr. Johnson leads our economic research team, bringing over 15 years of experience in international trade analysis and policy development.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    specialization: 'Trade Policy',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Data Science Director',
    bio: 'Michael oversees our data science initiatives, developing innovative methods to analyze and visualize complex trade data patterns.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    specialization: 'Machine Learning',
  },
  {
    id: 3,
    name: 'Amara Okafor',
    role: 'Head of Market Analysis',
    bio: 'Amara leads our market analysis team, helping clients identify opportunities and navigate complex global trade landscapes.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80',
    specialization: 'Emerging Markets',
  },
  {
    id: 4,
    name: 'Carlos Rodriguez',
    role: 'Senior Trade Analyst',
    bio: 'Carlos specializes in Latin American trade relations and has extensive experience in supply chain analysis and optimization.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    specialization: 'Supply Chain',
  },
  {
    id: 5,
    name: 'Emma Wilson',
    role: 'Product Development Lead',
    bio: 'Emma leads our product development team, ensuring our tools and platforms meet the evolving needs of our users.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80',
    specialization: 'UX Research',
  },
  {
    id: 6,
    name: 'Dr. Raj Patel',
    role: 'Research Director',
    bio: 'Dr. Patel oversees our research initiatives, focusing on the intersection of trade policy, economic development, and sustainability.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    specialization: 'Sustainable Trade',
  },
];

// Leadership team
const leadershipTeam = teamMembers.slice(0, 3);
// Analysts and specialists
const specialistsTeam = teamMembers.slice(3);

export default function TeamsPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Our Team</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
        Meet the experts behind Trade Data Explorer. Our diverse team combines expertise in economics, data science, and market analysis to deliver actionable trade insights.
      </p>
      
      {/* Leadership Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-gray-100">Leadership</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {leadershipTeam.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-[300px] w-full">
                <Image 
                  src={member.image} 
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 mb-3">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{member.bio}</p>
                <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
                  {member.specialization}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Specialists Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-gray-100">Analysts & Specialists</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {specialistsTeam.map((member) => (
            <div key={member.id} className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm p-6">
              <Avatar.Root className="flex-shrink-0 mr-4">
                <Avatar.Image
                  src={member.image}
                  alt={member.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <Avatar.Fallback className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{member.bio}</p>
                <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                  {member.specialization}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 