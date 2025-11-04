import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function FlashCardsPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const { data: decks, isLoading: decksLoading } = trpc.flashCards.getDecks.useQuery(undefined, { enabled: isAuthenticated });
  const { data: cards } = trpc.flashCards.getCards.useQuery(
    { deckId: selectedDeck! },
    { enabled: isAuthenticated && selectedDeck !== null }
  );

  const createDeckMutation = trpc.flashCards.createDeck.useMutation({
    onSuccess: () => {
      setDeckTitle("");
      setDeckDescription("");
      setShowCreateDeck(false);
    },
  });

  const addCardMutation = trpc.flashCards.addCard.useMutation({
    onSuccess: () => {
      setQuestion("");
      setAnswer("");
      setShowAddCard(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Flash Cards</h1>
          <p className="text-foreground/60 mb-8">Please log in to create and study flash cards</p>
          <Button onClick={() => setLocation("/")} className="bg-indigo-600 hover:bg-indigo-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateDeck = async () => {
    if (!deckTitle.trim()) return;
    await createDeckMutation.mutateAsync({
      title: deckTitle,
      description: deckDescription,
    });
  };

  const handleAddCard = async () => {
    if (!question.trim() || !answer.trim() || !selectedDeck) return;
    await addCardMutation.mutateAsync({
      deckId: selectedDeck,
      question,
      answer,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Flash Cards
              </h1>
            </div>
            <Button
              onClick={() => setShowCreateDeck(!showCreateDeck)}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Deck
            </Button>
          </div>
          <p className="text-foreground/60">Create and study with interactive flash cards</p>
        </motion.div>

        {/* Create Deck Form */}
        {showCreateDeck && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-indigo-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold mb-4">Create New Deck</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Deck Title"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300"
              />
              <textarea
                placeholder="Description (optional)"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300 h-24 resize-none"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateDeck}
                  disabled={createDeckMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {createDeckMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Deck"}
                </Button>
                <Button
                  onClick={() => setShowCreateDeck(false)}
                  className="bg-background border border-foreground/20 hover:border-foreground/40 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Decks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {decksLoading ? (
            <div className="col-span-full flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : decks && decks.length > 0 ? (
            decks.map((deck) => (
              <motion.div
                key={deck.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDeck(deck.id)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  selectedDeck === deck.id
                    ? "bg-indigo-600/20 border-indigo-500/60"
                    : "bg-background border-indigo-500/20 hover:border-indigo-500/40"
                }`}
              >
                <h3 className="text-xl font-bold text-foreground mb-2">{deck.title}</h3>
                <p className="text-foreground/60 text-sm mb-4">{deck.description}</p>
                <p className="text-indigo-400 font-semibold">{deck.cardCount || 0} cards</p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-foreground/60">No decks yet. Create your first deck!</p>
            </div>
          )}
        </motion.div>

        {/* Selected Deck Details */}
        {selectedDeck && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background border border-indigo-500/20 rounded-2xl p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">
                {decks?.find((d) => d.id === selectedDeck)?.title}
              </h2>
              <Button
                onClick={() => setShowAddCard(!showAddCard)}
                className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Card
              </Button>
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background/50 border border-indigo-500/20 rounded-lg p-6 mb-6"
              >
                <h3 className="text-xl font-bold mb-4">New Flash Card</h3>
                <div className="space-y-4">
                  <textarea
                    placeholder="Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300 h-20 resize-none"
                  />
                  <textarea
                    placeholder="Answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-background border border-indigo-500/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-indigo-500/60 transition-all duration-300 h-20 resize-none"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddCard}
                      disabled={addCardMutation.isPending}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {addCardMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Card"}
                    </Button>
                    <Button
                      onClick={() => setShowAddCard(false)}
                      className="bg-background border border-foreground/20 hover:border-foreground/40 text-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cards List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Cards ({cards?.length || 0})</h3>
              {cards && cards.length > 0 ? (
                cards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-background/50 border border-indigo-500/20 rounded-lg hover:border-indigo-500/40 transition-all duration-300"
                  >
                    <p className="font-semibold text-foreground mb-2">{card.question}</p>
                    <p className="text-foreground/70 text-sm">{card.answer}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-foreground/60 text-center py-8">No cards yet. Add your first card!</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
