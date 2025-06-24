
import React from 'react';
import { Award, Star, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DriverProfile = () => {
  return (
    <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-electric-800 mb-1">
              Chauffeur Pro
              <Badge className="ml-2 bg-green-100 text-green-700">
                <Award className="h-3 w-3 mr-1" />
                Chauffeur Vérifié
              </Badge>
            </h3>
            <div className="flex items-center gap-4 text-sm text-electric-600">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">4.9</span>
                <span className="text-electric-500">(127 courses)</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>98% réussite</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Répond en &lt; 5 min</span>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              {['Véhicules électriques', 'Urgences', 'Longue distance'].map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-electric-600">⭐ 4.9</div>
            <p className="text-xs text-electric-600">Note actuelle</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverProfile;
