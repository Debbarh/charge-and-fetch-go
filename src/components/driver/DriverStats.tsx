
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DriverStats = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-lg font-bold text-blue-600">12</div>
          <p className="text-xs text-muted-foreground">Services effectués</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-lg font-bold text-electric-600">347€</div>
          <p className="text-xs text-muted-foreground">Gains ce mois</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-lg font-bold text-yellow-500">⭐ 4.9</div>
          <p className="text-xs text-muted-foreground">Note moyenne</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverStats;
