import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  Cloud,
  Server,
  Link,
  Building2,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react-native";
import { trpc } from "@/lib/trpc";

export default function ExternalIntegrationsScreen() {
  const router = useRouter();

  const integrationsQuery = trpc.integrations.getAll.useQuery();
  const updateMutation = trpc.integrations.update.useMutation();
  const testMutation = trpc.integrations.test.useMutation();
  const syncMutation = trpc.integrations.sync.useMutation();

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "cloud_storage":
        return Cloud;
      case "local_server":
        return Server;
      case "external_api":
        return Link;
      case "bank":
        return Building2;
      case "whatsapp":
      case "telegram":
      case "viber":
        return MessageSquare;
      case "email":
        return Mail;
      case "sms":
        return Phone;
      default:
        return Link;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "#10B981";
      case "disconnected":
        return "#6B7280";
      case "error":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const handleToggle = async (integrationId: string, enabled: boolean) => {
    try {
      await updateMutation.mutateAsync({
        integrationId,
        enabled,
      });
      integrationsQuery.refetch();
      Alert.alert("سەرکەوتوو", "پەیوەندی نوێکرایەوە");
    } catch {
      Alert.alert("هەڵە", "کێشەیەک ڕوویدا");
    }
  };

  const handleTest = async (integrationId: string) => {
    try {
      const result = await testMutation.mutateAsync({ integrationId });
      Alert.alert("تاقیکردنەوە", result.message);
      integrationsQuery.refetch();
    } catch {
      Alert.alert("هەڵە", "تاقیکردنەوە سەرکەوتوو نەبوو");
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      await syncMutation.mutateAsync({ integrationId });
      integrationsQuery.refetch();
      Alert.alert("سەرکەوتوو", "پەیوەندی هاوکات کرا");
    } catch {
      Alert.alert("هەڵە", "هاوکاتکردن سەرکەوتوو نەبوو");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "پەیوەندیە دەرەکیەکان",
          headerStyle: { backgroundColor: "#6366F1" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>پەیوەندیە چالاکەکان</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-integration" as any)}
          >
            <Text style={styles.addButtonText}>+ زیادکردن</Text>
          </TouchableOpacity>
        </View>

        {integrationsQuery.data?.integrations.map((integration: any) => {
          const Icon = getIntegrationIcon(integration.type);
          const statusColor = getStatusColor(integration.status);
          const StatusIcon =
            integration.status === "connected" ? CheckCircle : XCircle;

          return (
            <View key={integration.id} style={styles.integrationCard}>
              <View style={styles.integrationHeader}>
                <View style={styles.integrationInfo}>
                  <Icon size={24} color="#6366F1" />
                  <View style={styles.integrationText}>
                    <Text style={styles.integrationName}>{integration.name}</Text>
                    <Text style={styles.integrationType}>{integration.type}</Text>
                  </View>
                </View>
                <Switch
                  value={integration.enabled}
                  onValueChange={(value) => handleToggle(integration.id, value)}
                  trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
                  thumbColor={integration.enabled ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  <StatusIcon size={16} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {integration.status === "connected"
                      ? "پەیوەستە"
                      : integration.status === "error"
                      ? "هەڵە"
                      : "پەیوەست نییە"}
                  </Text>
                </View>
                {integration.lastSync && (
                  <Text style={styles.lastSync}>
                    کۆتا هاوکاتکردن: {new Date(integration.lastSync).toLocaleDateString("ku")}
                  </Text>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleTest(integration.id)}
                >
                  <CheckCircle size={16} color="#6366F1" />
                  <Text style={styles.actionButtonText}>تاقیکردنەوە</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSync(integration.id)}
                >
                  <RefreshCw size={16} color="#6366F1" />
                  <Text style={styles.actionButtonText}>هاوکاتکردن</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(`/edit-integration/${integration.id}` as any)
                  }
                >
                  <Text style={styles.actionButtonText}>دەستکاریکردن</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {integrationsQuery.data?.integrations.length === 0 && (
          <View style={styles.emptyState}>
            <Link size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>هیچ پەیوەندیەک نییە</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/add-integration" as any)}
            >
              <Text style={styles.emptyButtonText}>زیادکردنی پەیوەندی</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  addButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  integrationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  integrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  integrationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  integrationText: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  integrationType: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  lastSync: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: "#6366F1",
    fontWeight: "600" as const,
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 14,
  },
});
