import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/store";
import { siteConfig } from "@/lib/data";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #ff3500",
    paddingBottom: 15,
  },
  name: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#080808",
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#888",
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ff3500",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  divider: {
    borderBottom: "1px solid #ddd",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  left: {
    flex: 1,
  },
  right: {
    width: 100,
    textAlign: "right",
  },
  jobTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#080808",
    marginBottom: 2,
  },
  company: {
    fontSize: 10,
    color: "#555",
    marginBottom: 2,
  },
  period: {
    fontSize: 9,
    color: "#ff3500",
  },
  description: {
    fontSize: 9,
    color: "#666",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  highlight: {
    fontSize: 9,
    color: "#555",
    paddingLeft: 10,
    marginBottom: 2,
  },
  bullet: {
    width: 10,
  },
  skillGroup: {
    marginBottom: 8,
  },
  skillCategory: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#555",
    marginBottom: 4,
  },
  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skill: {
    fontSize: 8,
    backgroundColor: "#f0f0f0",
    padding: "2 6",
    borderRadius: 2,
    color: "#333",
  },
  awardRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  awardYear: {
    width: 50,
    fontSize: 9,
    color: "#ff3500",
  },
  awardContent: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#080808",
  },
  awardOrg: {
    fontSize: 9,
    color: "#666",
  },
  clientList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  client: {
    fontSize: 9,
    color: "#555",
  },
});

interface CVPDFProps {
  cv: CVData;
}

export function CVPDF({ cv }: CVPDFProps) {
  const { experiences, skillGroups, tools, education, awards } = cv;

  return (
    <Document
      title={`${siteConfig.name} - CV`}
      author={siteConfig.name}
      subject="Curriculum Vitae"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{siteConfig.name}</Text>
          <Text style={styles.role}>{siteConfig.role}</Text>
          <Text style={styles.contact}>
            {siteConfig.email} · Indonesia · Est. 2017
          </Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.divider} />
          {experiences.map((exp, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.left}>
                <Text style={styles.jobTitle}>{exp.role}</Text>
                <Text style={styles.company}>{exp.organization}</Text>
                <Text style={styles.description}>{exp.description}</Text>
                {exp.highlights.map((h, j) => (
                  <Text key={j} style={styles.highlight}>• {h}</Text>
                ))}
              </View>
              <View style={styles.right}>
                <Text style={styles.period}>{exp.period}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.divider} />
          <View style={styles.skills}>
            {skillGroups.map((group, i) => (
              <View key={i} style={styles.skillGroup}>
                <Text style={styles.skillCategory}>{group.category}</Text>
                <View style={styles.skills}>
                  {group.items.map((item, j) => (
                    <Text key={j} style={styles.skill}>{item}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools</Text>
          <View style={styles.divider} />
          <View style={styles.skills}>
            {tools.map((group, i) => (
              <View key={i} style={styles.skillGroup}>
                <Text style={styles.skillCategory}>{group.category}</Text>
                <View style={styles.skills}>
                  {group.items.map((item, j) => (
                    <Text key={j} style={styles.skill}>{item}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.divider} />
          {education.map((edu, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.left}>
                <Text style={styles.jobTitle}>{edu.degree}</Text>
                <Text style={styles.company}>{edu.institution}</Text>
                {edu.description && <Text style={styles.description}>{edu.description}</Text>}
              </View>
              <View style={styles.right}>
                <Text style={styles.period}>{edu.period}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Awards */}
        {awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recognition</Text>
            <View style={styles.divider} />
            {awards.map((award, i) => (
              <View key={i} style={styles.awardRow}>
                <Text style={styles.awardYear}>{award.year}</Text>
                <View style={styles.awardContent}>
                  <Text style={styles.awardTitle}>{award.title}</Text>
                  <Text style={styles.awardOrg}>{award.organization}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={{ marginTop: 30, paddingTop: 10, borderTop: "1px solid #ddd" }}>
          <Text style={{ fontSize: 8, color: "#999", textAlign: "center" }}>
            {siteConfig.name} · {siteConfig.email} · {Object.values(siteConfig.social).find(Boolean) || "rizkyirawan.xyz"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
