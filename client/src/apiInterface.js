import axios from 'axios';
import store from './store';
import { addCardpack, removeCardpack, removeFriend, addFriend } from './store/modules/user';

const user = store.getState().user.currentUser;

const getUser = (id) => {
  return axios.get(`/api/user/${id}`)
    .then(res => res.data);
};

module.exports.deleteWhiteCard = (cardId) => {
  return axios.delete(`/api/cards/white/${cardId}`)
    .then(res => res.data);
};

module.exports.deleteBlackCard = (cardId) => {
  return axios.delete(`/api/cards/black/${cardId}`)
    .then(res => res.data);
};

module.exports.deleteCardpack = (cardpackId) => {
  return axios.delete(`/api/cardpack/${cardpackId}`)
    .then(res => res.data)
    .then(data => {
      store.dispatch(removeCardpack(cardpackId));
      return data;
    });
};

module.exports.createCardpack = (name) => {
  return axios.put(`/api/cardpacks/${user.id}`, {name})
    .then(res => res.data)
    .then(cardpack => {
      store.dispatch(addCardpack(cardpack));
      return cardpack;
    });
};

module.exports.getCardpack = (id) => {
  return axios.get(`/api/cardpack/${id}`)
    .then(res => res.data);
};

module.exports.createWhiteCards = (cardpackId, cards) => {
  return axios.put(`/api/cardpack/cards/white/${cardpackId}`, cards)
    .then(res => res.data);
};

module.exports.createBlackCards = (cardpackId, cards) => {
  return axios.put(`/api/cardpack/cards/black/${cardpackId}`, cards)
    .then(res => res.data);
};

module.exports.removeFriend = (friendId) => {
  return axios.delete(`/api/user/friends?userId=${user.id}&friendId=${friendId}`)
    .then(res => res.data)
    .then(data => {
      store.dispatch(removeFriend(friendId));
      return data;
    });
};

module.exports.addFriend = (friendId) => {
  return axios.put(`/api/user/friends?userId=${user.id}&friendId=${friendId}`)
    .then(res => res.data)
    .then((data) => {
      return getUser(friendId)
        .then((user) => {
          store.dispatch(addFriend(user));
          return data;
        });
    });
};

module.exports.searchUsers = (query) => {
  return axios.get(`/api/user/search?query=${query}`)
    .then(res => res.data);
};

module.exports.autocompleteUserSearch = (query) => {
  return axios.get(`/api/user/search/autocomplete?query=${query}`)
    .then(res => res.data);
};

module.exports.searchCardpacks = (query) => {
  return axios.get(`/api/cardpack/search?query=${query}`)
    .then(res => res.data);
};

module.exports.autocompleteCardpackSearch = (query) => {
  return axios.get(`/api/cardpack/search/autocomplete?query=${query}`)
    .then(res => res.data);
};