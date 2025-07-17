import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const BlogDetail = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { blog } = route.params;

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" size={45} color="white" />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>{t('blog')}</Text>
            </View>

            {/* Blog Content */}
            <ScrollView style={styles.content}>
                <Image source={{ uri: blog.image }} style={styles.blogImage} />
                <View style={styles.blogInfo}>
                    <Text style={styles.blogTitle}>{blog.title}</Text>
                    <View style={styles.reviewContainer}>
                        <Feather name="eye" size={16} color="gray" />
                        <Text style={styles.reviewText}>{t('reviews', { count: 10 })}</Text>
                    </View>
                    {/* Divider Line */}
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.aboutButton}>
                        <Text style={styles.aboutButtonText}>{t('aboutUs')}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.blogText}>{blog.fullText}</Text>

                <View style={styles.contentContainer}>

                    <Text style={styles.sectionTitle}>{t('ramadan2025')}</Text>
                    <Text style={styles.description}>{t('ramadanDescription')}</Text>

                    <Text style={styles.description}>
                        Muslims have their pre-fast meal known as Sehri before the time for Fajar Namaz begins. They do
                        not eat or drink anything afterward. They eat their post-fast meal known as Iftar after Azan-e-Maghrib.
                        Allah SWT blesses Muslims with the gift of Eid ul Fitr after fasting for Ramadan.
                    </Text>

                    <Text style={styles.description}>
                        The starting of the month of Ramadan depends on the sighting of the moon decided by the
                        Ruet-e-Hilal Committee of Pakistan in Pakistan and in the rest of the world by their respective
                        committees. It is to ensure the beginning of the month of Ramzan on the same day throughout
                        the country. In Thailand, the 1st Ramadan 1447 Hijri is expected to occur on 01 March 2025.
                    </Text>

                    {/* FAQ Section */}
                    <Text style={styles.sectionTitle}>{t('faqFirstDate')}</Text>
                    <Text style={styles.description}>{t('faqFirstDateAnswer')}</Text>

                    <Text style={styles.sectionTitle}>{t('faqBegin')}</Text>
                    <Text style={styles.description}>{t('faqBeginAnswer')}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#063c2f' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#063c2f' },
    backButton: { marginRight: 10, padding: 5 },
    pageTitle: { fontSize: 30, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center' },
    content: { backgroundColor: 'white', flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    blogImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
    blogInfo: { marginBottom: 10 },
    blogTitle: { fontSize: 18, fontWeight: 'bold' },
    reviewContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    reviewText: { fontSize: 14, color: 'gray', marginLeft: 5 },
    aboutButton: { borderWidth: 1, borderColor: '#063c2f', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginTop: 10, alignSelf: 'flex-start' },
    aboutButtonText: { color: '#063c2f', fontSize: 14 },
    blogText: { fontSize: 14, color: '#333', marginTop: 10, lineHeight: 22 },
    divider: {
        height: 1,
        backgroundColor: '#ccc', // Light gray color
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
    },
    contentContainer: {
        paddingHorizontal: 5,
        paddingVertical: 8,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#063c2f',
    },

    description: {
        fontSize: 16,
        color: '#444',
        marginBottom: 10,
        lineHeight: 23,
    },


});

export default BlogDetail;
