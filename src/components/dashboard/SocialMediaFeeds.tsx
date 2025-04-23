
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export const SocialMediaFeeds: React.FC = () => {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Social Media
          <div className="flex gap-2">
            <a 
              href="https://www.facebook.com/thepinehillfarm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <a 
              href="https://www.instagram.com/thepinehillfarm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Facebook and Instagram embed iframes will be added here */}
        <div className="space-y-4">
          <div className="fb-page" 
            data-href="https://www.facebook.com/thepinehillfarm"
            data-tabs="timeline" 
            data-width="500" 
            data-height="400" 
            data-small-header="true" 
            data-adapt-container-width="true" 
            data-hide-cover="false" 
            data-show-facepile="false"
          />
          <div className="instagram-media">
            <blockquote 
              className="instagram-media" 
              data-instgrm-permalink="https://www.instagram.com/thepinehillfarm"
              data-instgrm-version="14"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
