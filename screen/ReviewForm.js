import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Rating } from 'react-native-ratings';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from './FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ReviewForm = ({ visible, onClose, placeId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!rating || !comment) {
      Alert.alert('Error', 'Please provide both rating and comment');
      return;
    }

    try {
      const user = FIREBASE_AUTH.currentUser;
      const reviewData = {
        placeId,
        userId: user.uid,
        username: user.displayName || user.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(FIREBASE_DB, 'Reviews'), reviewData);
      Alert.alert('Success', 'Review submitted successfully');
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Write a Review</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.label}>Rating:</Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              onFinishRating={setRating}
              startingValue={rating}
              showRating
              fractions={1}
              jumpValue={0.5}
              onStartRating={() => {}}
              style={{ paddingVertical: 10 }}
              tintColor="#f0f0f0"
            />
            {rating > 0 && (
              <Text style={styles.ratingText}>
                You rated {rating} {rating === 1 ? 'star' : 'stars'}
              </Text>
            )}
          </View>

          <View style={styles.commentContainer}>
            <Text style={styles.label}>Comment:</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              placeholder="Write your review here..."
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#014737',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#014737',
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#014737',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingText: {
    fontSize: 14,
    color: '#014737',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ReviewForm;