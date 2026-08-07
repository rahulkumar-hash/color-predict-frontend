import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TrendChart from '../components/TrendChart';
import HistoryTable from '../components/HistoryTable';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import RulesModal from '../components/RulesModal';
import BottomNav from '../components/BottomNav';
import { useGameStore } from '../store/useGameStore';

export default function TrendsPage() {
  const { history, fetchHistory } = useGameStore();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center">
      <Header
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenWithdraw={() => setShowWithdrawalModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
      />

      <main className="w-full max-w-7xl px-3 sm:px-6 space-y-4">
        {/* Color Pattern Trend Analytics */}
        <TrendChart history={history} />

        {/* Game Record Logs with Pagination */}
        <HistoryTable history={history} />
      </main>

      {/* Action Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
      />

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <BottomNav
        onOpenDeposit={() => setShowDepositModal(true)}
      />
    </div>
  );
}
