import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  completedPaths: number;
  totalNodes: number;
  progress: number;
  lastUpdated: string;
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    // 从localStorage获取当前用户的成就数据
    const completedPathsStr = localStorage.getItem('completedPaths');
    const completedNodesStr = localStorage.getItem('completedNodes');
    
    const completedPaths = completedPathsStr ? JSON.parse(completedPathsStr) : [];
    const completedNodes = completedNodesStr ? JSON.parse(completedNodesStr) : [];

    // 模拟排行榜数据（实际应用中应从后端获取）
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user_001',
        username: '精神分析大师',
        completedPaths: 6,
        totalNodes: 42,
        progress: 100,
        lastUpdated: '2026-02-24'
      },
      {
        rank: 2,
        userId: 'user_002',
        username: '心理学爱好者',
        completedPaths: 5,
        totalNodes: 38,
        progress: 90,
        lastUpdated: '2026-02-23'
      },
      {
        rank: 3,
        userId: 'user_003',
        username: '理论研究者',
        completedPaths: 4,
        totalNodes: 32,
        progress: 76,
        lastUpdated: '2026-02-22'
      },
      {
        rank: 4,
        userId: 'user_004',
        username: '学习者',
        completedPaths: 3,
        totalNodes: 24,
        progress: 57,
        lastUpdated: '2026-02-21'
      },
      {
        rank: 5,
        userId: 'user_005',
        username: '新手',
        completedPaths: 2,
        totalNodes: 16,
        progress: 38,
        lastUpdated: '2026-02-20'
      },
      {
        rank: 6,
        userId: 'user_006',
        username: '探索者',
        completedPaths: 1,
        totalNodes: 8,
        progress: 19,
        lastUpdated: '2026-02-19'
      }
    ];

    setLeaderboardData(mockLeaderboard);

    // 设置当前用户的排名（模拟）
    const currentUserRank: LeaderboardEntry = {
      rank: 7,
      userId: 'current_user',
      username: '你',
      completedPaths: completedPaths.length,
      totalNodes: completedNodes.length,
      progress: Math.round((completedNodes.length / 42) * 100),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setUserRank(currentUserRank);
  }, []);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>返回网络图</span>
          </Link>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">学习排行榜</h1>
          </div>
          <p className="text-muted-foreground">查看全球精神分析学习者的成就排名</p>
        </div>

        {/* 排行榜表格 */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">排名</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">用户名</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">完成路径</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">学习节点</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">完成度</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">最后更新</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry) => (
                  <tr key={entry.userId} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {getMedalIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{entry.username}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {entry.completedPaths}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-foreground font-medium">{entry.totalNodes}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${entry.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-primary w-8 text-right">{entry.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {entry.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 当前用户排名 */}
        {userRank && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">你的排名</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">当前排名</div>
                <div className="text-2xl font-bold text-primary">#{userRank.rank}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">完成路径</div>
                <div className="text-2xl font-bold text-foreground">{userRank.completedPaths}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">学习节点</div>
                <div className="text-2xl font-bold text-foreground">{userRank.totalNodes}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">完成度</div>
                <div className="text-2xl font-bold text-primary">{userRank.progress}%</div>
              </div>
            </div>
          </div>
        )}

        {/* 说明信息 */}
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3">排行榜说明</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 排行榜基于完成的学习路径数和学习节点数进行排名</li>
            <li>• 完成度是指学习的节点数占总节点数的百分比</li>
            <li>• 排行榜每天更新一次，显示最近30天内的活跃用户</li>
            <li>• 继续学习新的概念，提升你的排名和成就</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
