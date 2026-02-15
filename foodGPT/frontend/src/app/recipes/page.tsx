'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRecipesFromChats, UserRecipe } from '@/lib/firestore';

export default function RecipesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 🔥 Fetch recipes from Firestore chats
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return;

      try {
        const userRecipes = await getUserRecipesFromChats(user.uid);
        setRecipes(userRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [user]);

  if (loading || loadingRecipes) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Recipes</h1>

      {recipes.length === 0 ? (
        <p>You haven’t uploaded any recipes yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Recipe Image */}
              <img
                src={recipe.image_url || '/placeholder-food.jpg'}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />

              {/* Recipe Info */}
              <div className="p-4 space-y-2">
                <h2 className="font-semibold">{recipe.title}</h2>

                <button
                  onClick={() => router.push(`/dashboard?chatId=${recipe.id}`)}
                  className="text-orange-600 hover:underline"
                >
                  Open Chat →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
