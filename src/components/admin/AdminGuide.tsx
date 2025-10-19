import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Database, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminGuide = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2">
        <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Guide Admin</h1>
        <p className="text-muted-foreground">
          Comment créer un compte administrateur
        </p>
      </div>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Création d'un compte admin</AlertTitle>
        <AlertDescription>
          Pour donner les droits admin à un utilisateur, suivez ces étapes
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Créer un compte utilisateur</h3>
              <p className="text-sm text-muted-foreground">
                Inscrivez-vous normalement via la page /auth avec l'email que vous voulez utiliser comme admin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Accéder au backend</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ouvrez le backend Lovable Cloud (Supabase) pour exécuter du SQL.
              </p>
              <Button
                onClick={() => window.open('https://lovable.dev', '_blank')}
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                Ouvrir le Backend
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Exécuter la commande SQL</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Dans l'éditeur SQL, exécutez cette commande en remplaçant l'email:
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <code>
                  SELECT public.create_admin_user('votre-email@example.com');
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Rafraîchir la page</h3>
              <p className="text-sm text-muted-foreground">
                Déconnectez-vous et reconnectez-vous. L'onglet "Admin" devrait maintenant apparaître dans la navigation.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Alert variant="default">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Sécurité</AlertTitle>
        <AlertDescription>
          Les vérifications de rôle admin sont effectuées côté serveur avec des fonctions SECURITY DEFINER.
          Impossible de contourner les permissions même en modifiant le code client.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AdminGuide;
