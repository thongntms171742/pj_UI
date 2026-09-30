import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, MessageCircle, Percent, Bell, Star } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useNotifications } from '../../hooks/queries';
import { notificationApi } from '../../api/endpoints';
import { EmptyState } from '../../components/EmptyState';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, SOFT, serif } from '../../theme/colors';

const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  MessageCircle,
  Percent,
  Bell,
  Truck: Package,
  Star,
};

const TYPE_COLOR: Record<string, string> = {
  order: '#27AE60',
  chat: '#2980B9',
  promo: T,
  system: COFFEE,
  review: '#9B59B6',
};

export function NotificationsScreen() {
  const { data, loading, refresh } = useNotifications();
  const unread = (data ?? []).filter((n) => !n.read).length;

  const handleMarkAll = async () => {
    if (!data) return;
    const unread = data.filter((n) => !n.read);
    await Promise.all(unread.map((n) => (n.apiId ? notificationApi.markRead(n.apiId).catch(() => null) : null)));
    refresh();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, serif]}>Thông báo</Text>
          <Text style={styles.subtitle}>
            {loading
              ? 'Đang tải...'
              : unread > 0
              ? `${unread} thông báo chưa đọc`
              : 'Tất cả thông báo đã được đọc'}
          </Text>
        </View>
        {unread > 0 && !loading ? (
          <TouchableOpacity
            onPress={handleMarkAll}
            style={styles.markAllBtn}
          >
            <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={T} />
        }
      >
        {!loading && (!data || data.length === 0) ? (
          <EmptyState title="Chưa có thông báo nào" />
        ) : (
          (data ?? []).map((n) => {
            const Icon = ICON_MAP[n.icon];
            const color = TYPE_COLOR[n.type] ?? T;
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.85}
                style={[
                  styles.row,
                  !n.read && { borderColor: T + '55', backgroundColor: T + '0A' },
                ]}
                onPress={async () => {
                  if (!n.read && n.apiId) {
                    await notificationApi.markRead(n.apiId).catch(() => null);
                    refresh();
                  }
                }}
              >
                <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
                  {Icon ? <Icon size={20} color={color} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowHeader}>
                    <Text style={[styles.rowTitle, !n.read && { color: ESPRESSO }]}>
                      {n.title}
                    </Text>
                    {!n.read ? (
                      <View style={[styles.unreadDot, { backgroundColor: color }]} />
                    ) : null}
                  </View>
                  <Text style={styles.rowDesc} numberOfLines={2}>
                    {n.desc}
                  </Text>
                  <Text style={styles.rowTime}>{n.time}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LINEN,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: MUTED,
    gap: 8,
  },
  title: {
    color: ESPRESSO,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 2,
  },
  markAllBtn: {
    backgroundColor: SOFT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  markAllText: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: {
    color: COFFEE,
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  rowDesc: {
    color: COFFEE,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  rowTime: {
    color: MUTED,
    fontSize: 11,
    marginTop: 6,
  },
});