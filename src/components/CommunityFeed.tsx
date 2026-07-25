import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Loader2, Sparkles, Building2 } from "lucide-react";
import { getAllPosts, toggleLikePost, Post } from "@/lib/firestore";

interface CommunityFeedProps {
  studentId: string;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatRelative = (value: any) => {
  const date = value?.toDate ? value.toDate() : new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const LikeButton = ({
  post,
  liked,
  onToggle,
}: {
  post: Post;
  liked: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      liked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
    }`}
  >
    <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} />
    {post.likedBy.length > 0 ? post.likedBy.length : "Like"}
  </button>
);

const Byline = ({ post, size = "sm" }: { post: Post; size?: "sm" | "lg" }) => (
  <div className="flex items-center gap-2.5">
    <div
      className={`rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold font-heading flex-shrink-0 ${
        size === "lg" ? "w-11 h-11 text-base" : "w-8 h-8 text-xs"
      }`}
    >
      {initialsOf(post.businessName || "NextStep")}
    </div>
    <div className="min-w-0">
      <div
        className={`inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 ${
          size === "lg" ? "px-2.5 py-1" : "px-2 py-0.5"
        }`}
      >
        <Building2 className={size === "lg" ? "h-3.5 w-3.5 text-primary" : "h-3 w-3 text-primary"} />
        <span className={`font-semibold text-primary truncate ${size === "lg" ? "text-sm" : "text-xs"}`}>
          {post.businessName || "NextStep"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{formatRelative(post.createdAt)}</p>
    </div>
  </div>
);

const CommunityFeed = ({ studentId }: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAllPosts();
        setPosts(data);
      } catch (err) {
        // Silent fail — feed just renders empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleLike = async (post: Post) => {
    const isLiked = post.likedBy.includes(studentId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedBy: isLiked ? p.likedBy.filter((id) => id !== studentId) : [...p.likedBy, studentId] }
          : p
      )
    );
    try {
      await toggleLikePost(post.id!, studentId, isLiked);
    } catch (err) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const [lead, ...rest] = posts;
  const dateline = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <div className="border-b-2 border-foreground pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{dateline}</p>
        <h2 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight leading-none">
          Community Feed
        </h2>
        <p className="text-muted-foreground mt-3">See what's happening across NextStep right now.</p>
      </div>

      {posts.length === 0 ? (
        <Card className="border-0 shadow-warm-md bg-card">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No updates yet. Check back soon for project spotlights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Lead story */}
          {(() => {
            const isLiked = lead.likedBy.includes(studentId);
            return (
              <Card className="border-0 shadow-warm-lg bg-card overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary via-nextstep-ember to-primary" />
                <CardContent className="p-6 sm:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3">
                    {lead.category ? lead.category : "Featured"} &middot; Latest
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground leading-snug mb-5 max-w-3xl">
                    {lead.caption}
                  </h3>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <Byline post={lead} size="lg" />
                    <LikeButton post={lead} liked={isLiked} onToggle={() => handleToggleLike(lead)} />
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Secondary stories */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post) => {
                const isLiked = post.likedBy.includes(studentId);
                return (
                  <Card
                    key={post.id}
                    className="border border-border shadow-sm hover:shadow-md transition-shadow bg-card flex flex-col"
                  >
                    <CardContent className="p-5 flex flex-col flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary mb-2">
                        {post.category || "NextStep"}
                      </p>
                      <h4 className="text-base font-bold font-heading text-foreground leading-snug mb-4 flex-1 line-clamp-4">
                        {post.caption}
                      </h4>
                      <div className="space-y-3 pt-3 border-t border-border">
                        <Byline post={post} />
                        <LikeButton post={post} liked={isLiked} onToggle={() => handleToggleLike(post)} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
