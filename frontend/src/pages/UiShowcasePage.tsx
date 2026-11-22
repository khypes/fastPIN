import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Card,
  Chip,
  Segmented,
  Input,
  BottomSheet,
  useToast,
  Skeleton,
  EmptyState,
  ErrorState,
  StatusBadge,
  Timeline,
  BalanceCard,
  TransactionRow,
  GameCard,
  PackCard,
  BottomNav,
  type TabKey,
  BannerCarousel,
  SearchBar,
  Avatar,
  CopyField,
} from '../ui';
import { Sun, Moon, Sparkles, Send, Bell } from 'lucide-react';

export const UiShowcasePage: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState('pack-2');
  const [segmentedVal, setSegmentedVal] = useState('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('NightHawk_99');

  const { success, error, warning, toast } = useToast();

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const banners = [
    {
      id: 'b1',
      title: 'PUBG Mobile 660 UC + 60 Bonus',
      subtitle: 'Bugun barcha UC paketlarga 10% gacha keshbek',
      badge: 'PROMO',
      bgGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    },
    {
      id: 'b2',
      title: 'Telegram Stars va Premium',
      subtitle: 'Tezkor yetkazish — atigi 30 soniyada',
      badge: 'TOP',
      bgGradient: 'from-indigo-600 via-violet-600 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-app text-main font-sans pb-28 pt-4 px-4 transition-colors">
      {/* Top Header & Theme Switcher */}
      <div className="max-w-md mx-auto flex items-center justify-between pb-4 mb-6 border-b border-main">
        <div>
          <span className="text-[11px] font-bold text-brand uppercase tracking-wider">FastPAY UI Kit</span>
          <h1 className="text-xl font-extrabold text-main">Dizayn Tizimi /_ui</h1>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-main rounded-sm-app touch-target text-xs font-semibold cursor-pointer active:scale-95 transition-all"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-warn" />
              <span>Light rejim</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-brand" />
              <span>Dark rejim</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* 1. BUTTONS */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">1. Tugmalar (Button)</h2>
          <div className="flex flex-col gap-2.5">
            <Button variant="primary" size="lg" fullWidth>
              Asosiy CTA Tugma (52–56px)
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="md">
                Ikkilamchi
              </Button>
              <Button variant="danger" size="md">
                Xavfli / Bekor
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm">
                Ghost tugma
              </Button>
              <Button variant="primary" size="sm" loading>
                Yuklanmoqda
              </Button>
            </div>
            <Button variant="primary" disabled fullWidth>
              Faol emas (Disabled)
            </Button>
            <div className="flex items-center gap-3">
              <IconButton label="Yuborish" variant="primary">
                <Send className="w-5 h-5" />
              </IconButton>
              <IconButton label="Bildirishnoma" variant="secondary">
                <Bell className="w-5 h-5" />
              </IconButton>
              <IconButton label="Yulduzcha" variant="ghost">
                <Sparkles className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        </section>

        {/* 2. CHIP & SEGMENTED */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">2. Segmented & Chiplar</h2>
          <Segmented
            value={segmentedVal}
            onChange={setSegmentedVal}
            options={[
              { value: 'games', label: "O'yinlar", badge: 8 },
              { value: 'services', label: 'Xizmatlar', badge: 3 },
            ]}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Chip selected>10 000 so'm</Chip>
            <Chip>50 000 so'm</Chip>
            <Chip>100 000 so'm</Chip>
            <Chip>200 000 so'm</Chip>
          </div>
        </section>

        {/* 3. INPUT & SEARCH */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">3. Input & Qidiruv</h2>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="O'yin yoki mahsulotni qidirish..."
          />
          <Input
            label="Player ID"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onClear={() => setInputValue('')}
            helperText="PUBG Mobile profilingizdagi 10 xonali raqam"
          />
          <Input
            label="Xato holatidagi maydon"
            value="12345"
            error="Player ID topilmadi. Raqamni tekshiring."
          />
          <CopyField label="Referal havola yoki Karta raqami" value="8600 4912 3456 7890" />
        </section>

        {/* 4. BALANCE CARD */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">4. Balans Kartasi</h2>
          <BalanceCard
            balance={125000}
            onTopUp={() => success("To'ldirish oynasi ochilmoqda")}
          />
        </section>

        {/* 5. PACK CARDS */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">5. Paket Kartalari (PackCard)</h2>
          <div className="grid grid-cols-2 gap-3">
            <PackCard
              id="pack-1"
              amount={60}
              unit="UC"
              price={12000}
              selected={selectedPack === 'pack-1'}
              onSelect={() => setSelectedPack('pack-1')}
            />
            <PackCard
              id="pack-2"
              amount={325}
              unit="UC"
              bonus="25"
              price={65000}
              oldPrice={72000}
              badge="popular"
              selected={selectedPack === 'pack-2'}
              onSelect={() => setSelectedPack('pack-2')}
            />
            <PackCard
              id="pack-3"
              amount={660}
              unit="UC"
              bonus="60"
              price={125000}
              oldPrice={140000}
              badge="best_value"
              selected={selectedPack === 'pack-3'}
              onSelect={() => setSelectedPack('pack-3')}
            />
            <PackCard
              id="pack-4"
              amount={1800}
              unit="UC"
              price={340000}
              disabled
              selected={selectedPack === 'pack-4'}
              onSelect={() => {}}
              onNotify={() => toast("Stokka tushganda sizga xabar beramiz!")}
            />
          </div>
        </section>

        {/* 6. GAME CARDS */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">6. O'yin Kartalari (GameCard)</h2>
          <div className="grid grid-cols-2 gap-3">
            <GameCard
              id="pubg"
              name="PUBG Mobile"
              category="battle-royale"
              minPrice={12000}
              letter="P"
              iconGradient="from-amber-600 to-orange-600"
              badge="hot"
              onClick={() => success("PUBG Mobile tanlandi")}
            />
            <GameCard
              id="tg"
              name="Telegram Stars"
              category="services"
              minPrice={15000}
              letter="T"
              iconGradient="from-sky-500 to-blue-600"
              badge="new"
              onClick={() => success("Telegram tanlandi")}
            />
          </div>
        </section>

        {/* 7. BANNER CAROUSEL */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">7. Banner Karusel</h2>
          <BannerCarousel
            banners={banners}
            onBannerClick={(b) => toast(b.title)}
          />
        </section>

        {/* 8. TRANSACTIONS & TIMELINE */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">8. Tranzaksiya & Timeline</h2>
          <div className="space-y-2">
            <TransactionRow
              id="tx1"
              type="topup"
              title="Hisob to'ldirish (Payme)"
              amount={100000}
              status="completed"
              date="Bugun, 14:20"
            />
            <TransactionRow
              id="tx2"
              type="purchase"
              title="660 UC (PUBG Mobile)"
              amount={125000}
              status="pending"
              date="Kecha, 18:45"
            />
            <TransactionRow
              id="tx3"
              type="refund"
              title="Qaytarilgan to'lov"
              amount={36000}
              status="completed"
              date="20-noyabr, 10:11"
            />
          </div>

          <Card variant="surface1" className="mt-4">
            <h3 className="text-xs font-bold text-sec mb-3 uppercase tracking-wider">Buyurtma Yetkazish Jarayoni</h3>
            <Timeline
              steps={[
                { title: "To'lov qabul qilindi", status: 'completed', time: '14:20' },
                { title: 'Serverga yuborilmoqda', status: 'completed', time: '14:21' },
                { title: "Hisobga yetkazilmoqda (~38 soniya)", status: 'active', description: 'Avtomatik topshirish davom etmoqda' },
                { title: 'Yakunlandi', status: 'pending' },
              ]}
            />
          </Card>
        </section>

        {/* 9. STATUS BADGES & AVATARS */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">9. Status Badges & Avatarlar</h2>
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="success">Yetkazildi</StatusBadge>
            <StatusBadge variant="info">Jarayonda</StatusBadge>
            <StatusBadge variant="warn">Kutilmoqda</StatusBadge>
            <StatusBadge variant="danger">Qaytarildi</StatusBadge>
            <StatusBadge variant="neutral">Oddiy</StatusBadge>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Avatar name="Ali Valiyev" size="sm" isOnline />
            <Avatar name="Sardor Bek" size="md" isOnline />
            <Avatar name="FastPay Admin" size="lg" />
          </div>
        </section>

        {/* 10. MODAL / BOTTOM SHEET & TOASTS */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">10. BottomSheet & Toast</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
              Sheetni ochish
            </Button>
            <Button variant="primary" onClick={() => success("Muvaffaqiyatli xarid!")}>
              Toast sinash
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => warning("Diqqat, zaxira kam qoldi!")}>
              Warning Toast
            </Button>
            <Button variant="danger" onClick={() => error("Internet xatosi yuz berdi")}>
              Error Toast
            </Button>
          </div>
        </section>

        {/* 11. STATES (LOADING, EMPTY, ERROR) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-sec uppercase tracking-wider">11. Holatlar (States)</h2>
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-20 w-full" rounded="md" />
              <Skeleton className="h-20 w-full" rounded="md" />
            </div>
          </div>
          <EmptyState
            title="Hali buyurtmalar yo'q"
            description="Siz birorta ham mahsulot xarid qilmadingiz. Bosh sahifadan o'yin paketlarini ko'ring."
            actionLabel="Xaridni boshlash"
            onAction={() => success("Bosh sahifaga yo'naltirildi")}
          />
          <ErrorState
            title="Ulanish xatosi"
            message="Server bilan aloqa o'rnatib bo'lmadi. Qayta urinib ko'ring."
            onRetry={() => toast("Qayta yuklanmoqda...")}
          />
        </section>
      </div>

      {/* BottomSheet Modal Component */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Xaridni tasdiqlash"
        description="Tanlangan paket ma'lumotlari"
      >
        <div className="space-y-4 pt-1">
          <Card variant="surface2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-main">PUBG Mobile — 660 UC</h4>
                <p className="text-xs text-sec">ID: 512894192 (NightHawk_UZ)</p>
              </div>
              <span className="text-base font-extrabold text-main tabular-nums">125 000 so'm</span>
            </div>
          </Card>
          <p className="text-xs text-sec">
            Mablag' FastPAY hamyon balansingizdan yechiladi va UC avtomatik yetkaziladi.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setIsSheetOpen(false);
              success("Buyurtma qabul qilindi!");
            }}
          >
            125 000 so'm to'lash
          </Button>
        </div>
      </BottomSheet>

      {/* BottomNav Preview */}
      <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
