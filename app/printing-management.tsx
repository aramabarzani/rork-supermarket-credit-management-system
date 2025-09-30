import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Printer, FileText, CreditCard, User, Settings } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

export default function PrintingManagementScreen() {
  const router = useRouter();

  const templatesQuery = trpc.printing.getTemplates.useQuery();

  const printTypes = [
    { id: "receipt", name: "وەسڵ", icon: FileText, color: "#3B82F6" },
    { id: "customer_card", name: "کارتی کڕیار", icon: CreditCard, color: "#10B981" },
    { id: "employee_card", name: "کارتی کارمەند", icon: User, color: "#F59E0B" },
    { id: "report", name: "ڕاپۆرت", icon: Printer, color: "#8B5CF6" },
  ];

  const handleQuickPrint = (type: string) => {
    Alert.alert(
      "چاپکردن",
      `دڵنیای لە چاپکردنی ${printTypes.find((t) => t.id === type)?.name}؟`,
      [
        { text: "پاشگەزبوونەوە", style: "cancel" },
        {
          text: "چاپکردن",
          onPress: () => {
            console.log(`Printing ${type}`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "بەڕێوەبردنی چاپکردن",
          headerStyle: { backgroundColor: "#8B5CF6" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>چاپکردنی خێرا</Text>
          <View style={styles.grid}>
            {printTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeCard, { borderColor: type.color }]}
                  onPress={() => handleQuickPrint(type.id)}
                >
                  <Icon size={32} color={type.color} />
                  <Text style={styles.typeName}>{type.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تێمپلەیتەکان</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create-print-template" as any)}
            >
              <Text style={styles.addButtonText}>+ زیادکردن</Text>
            </TouchableOpacity>
          </View>

          {templatesQuery.data?.templates.map((template: any) => (
            <View key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                <View style={styles.templateBadge}>
                  <Text style={styles.templateBadgeText}>{template.type}</Text>
                </View>
              </View>
              <View style={styles.templateDetails}>
                <Text style={styles.templateDetail}>
                  قەبارە: {template.settings.paperSize}
                </Text>
                <Text style={styles.templateDetail}>
                  ئاراستە: {template.settings.orientation}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.useTemplateButton}
                onPress={() => handleQuickPrint(template.type)}
              >
                <Printer size={16} color="#fff" />
                <Text style={styles.useTemplateButtonText}>بەکارهێنان</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ڕێکخستنەکانی چاپکردن</Text>
          <TouchableOpacity
            style={styles.settingsCard}
            onPress={() => router.push("/print-settings" as any)}
          >
            <Settings size={24} color="#8B5CF6" />
            <Text style={styles.settingsText}>ڕێکخستنەکانی چاپکردن</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    textAlign: "center" as const,
  },
  templateCard: {
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
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  templateBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  templateBadgeText: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "600" as const,
  },
  templateDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  templateDetail: {
    fontSize: 13,
    color: "#6B7280",
  },
  useTemplateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  useTemplateButtonText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  settingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
});
