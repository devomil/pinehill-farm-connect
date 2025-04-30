import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTrainings } from "@/hooks/useTrainings";
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle } from "lucide-react";

export default function Training() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const { trainings, isLoading, error, userProgress, isUserProgressLoading, userProgressError } = useTrainings(currentUser?.id);

  useEffect(() => {
    if (error) {
      console.error("Error fetching trainings:", error);
    }
    if (userProgressError) {
      console.error("Error fetching user training progress:", userProgressError);
    }
  }, [error, userProgressError]);

  const handleSelectTraining = (trainingId: string) => {
    setSelectedTraining(trainingId);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedTraining(null);
  };

  const userTrainingProgress = userProgress.find(p => p.trainingId === selectedTraining);

  const requiredTrainings = trainings.filter(training =>
    training.requiredFor.includes(currentUser?.role || 'employee')
  );

  const inProgressTrainings = trainings.filter(training => {
    const progress = userProgress.find(p => p.trainingId === training.id);
    return progress && progress.status === 'in-progress';
  });

  // Correct the completed to completedAt
  const completedTrainings = trainings.filter(training => {
    const progress = userProgress.find(p => p.trainingId === training.id);
    return progress && progress.completedAt;
  });

  const filteredTrainings = trainings.filter(training => {
    if (activeTab === 'required') {
      return training.requiredFor.includes(currentUser?.role || 'employee');
    }
    return true;
  });

  // Render function - update all references from completed to completedAt
  return (
    <DashboardLayout>
      <div className="space-y-4 p-8">
        <div className="text-2xl font-bold">Training</div>
        <div className="tabs">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleTabChange('all')}
            >
              All Trainings
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'required' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleTabChange('required')}
            >
              Required
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleTabChange('in-progress')}
            >
              In Progress
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleTabChange('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {isLoading ? (
          <div>Loading trainings...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <div className="space-y-4">
            {selectedTraining && (
              <div className="space-y-4">
                {trainings
                  .filter(training => training.id === selectedTraining)
                  .map(training => (
                    <div key={training.id} className="space-y-2">
                      <div className="text-xl font-semibold">{training.title}</div>
                      <p>{training.description}</p>
                      {userTrainingProgress?.completedAt ? (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>Completed on {format(new Date(userTrainingProgress.completedAt), 'PPP')}</span>
                        </div>
                      ) : (
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                          Start Training
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Update all other instances of .completed to .completedAt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {activeTab === 'required' && requiredTrainings.length > 0 ? (
                requiredTrainings.map(training => (
                  <div key={training.id} className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md">
                    <div className="font-semibold">{training.title}</div>
                    <p className="text-sm text-gray-500">{training.description}</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">
                      Start Training
                    </button>
                  </div>
                ))
              ) : activeTab === 'in-progress' && inProgressTrainings.length > 0 ? (
                inProgressTrainings.map(training => (
                  <div key={training.id} className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md">
                    <div className="font-semibold">{training.title}</div>
                    <p className="text-sm text-gray-500">{training.description}</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">
                      Continue Training
                    </button>
                  </div>
                ))
              ) : activeTab === 'completed' && completedTrainings.length > 0 ? (
                completedTrainings.map(training => {
                  const progress = userProgress.find(p => p.trainingId === training.id);
                  return (
                    <div key={training.id}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md"
                      onClick={() => handleSelectTraining(training.id)}
                    >
                      <div className="font-semibold">{training.title}</div>
                      <p className="text-sm text-gray-500">{training.description}</p>
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Completed {progress?.completedAt ? formatDistanceToNow(new Date(progress.completedAt), { addSuffix: true }) : ''}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                activeTab !== 'all' && <div className="text-center py-8 text-gray-500 col-span-3">No trainings found in this category.</div>
              )}

              {activeTab === 'all' && (
                <div className="col-span-1 md:col-span-3">
                  <div className="text-lg font-semibold">All Trainings</div>
                  <div className="space-y-2 mt-4">
                    {filteredTrainings.map(training => {
                      const progress = userProgress.find(p => p.trainingId === training.id);
                      const isCompleted = progress?.completedAt !== undefined;

                      return (
                        <div key={training.id}
                          className={`border p-3 rounded cursor-pointer hover:bg-gray-50 ${
                            isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                          }`}
                          onClick={() => handleSelectTraining(training.id)}
                        >
                          <div className="font-semibold">{training.title}</div>
                          <p className="text-sm text-gray-500">{training.description}</p>
                          {isCompleted && (
                            <div className="text-green-600 text-sm flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed {formatDistanceToNow(new Date(progress.completedAt!), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
