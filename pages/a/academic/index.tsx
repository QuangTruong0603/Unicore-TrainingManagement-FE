import React from "react";
import { useRouter } from "next/router";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Book, Calendar, Clock, GraduationCap, Map } from "lucide-react";

import DefaultLayout from "@/layouts/default";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

export default function AcademicIndexPage() {
  const router = useRouter();
  
  const features: FeatureCard[] = [
    {
      title: "Courses Management",
      description: "Create, update, and manage courses and their descriptions",
      icon: <Book size={24} />,
      link: "/a/academic/courses",
    },
    {
      title: "Majors",
      description: "Manage academic majors and their requirements",
      icon: <GraduationCap size={24} />,
      link: "/a/academic/majors",
    },
    {
      title: "Training Roadmaps",
      description: "Define and manage training roadmaps for various majors",
      icon: <Map size={24} />,
      link: "/a/academic/training-roadmap",
    },
    {
      title: "Semesters",
      description: "Configure academic semesters and their timelines",
      icon: <Calendar size={24} />,
      link: "/a/academic/semesters",
    },
    {
      title: "Class Registration Scheduling",
      description: "Set up registration periods for classes",
      icon: <Clock size={24} />,
      link: "/a/academic/class-registration",
    },
  ];

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Academic Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title}>
              <Card className="h-full hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {feature.icon}
                  </div>
                  <h2 className="text-lg font-semibold">{feature.title}</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button
                    color="primary"
                    fullWidth
                    onClick={() => navigateTo(feature.link)}
                    variant="light"
                  >
                    Access
                  </Button>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
