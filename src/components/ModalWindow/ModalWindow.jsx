import { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { useDispatch, useSelector } from 'react-redux'
import { AxiosMotion } from '../../axios/Axios'
import { create_post, get_posts } from '../../store/slices/PostSlice'
import {
  CreatePostForm,
  PostButton,
  PostProfileImage,
} from '../../components/PostFeed/PostFeed.styled'
import UploadAndDisplayImage from '../../components/UploadImage/uploadimage'
import buttonpost from '../../assets/svgs/button-post.svg'
import { getUserProfileSuccess } from '../../store/slices/UserProfileSlice'
import avatar from '../../assets/svgs/avatar.svg'

import {
  ModalContainer,
  ModalContainerTop,
  ModalContainerTopLeft,
  ModalContainerTopRight,
  ModalTextInput,
  ModalContainerBottom,
} from './ModalWindow.styled.jsx'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '560px',
    height: '406px',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
}

Modal.setAppElement('#root')

export const ModalWindow = ({ isOpen, onRequestClose }) => {
  const token = useSelector((state) => state.user.accessToken)
  const userProfile = useSelector((state) => state.userProfile.user)

  const dispatch = useDispatch()

  //added newPost stateContent to manage setNewPostContent
  const [newPostContent, setNewPostContent] = useState('')
  //added to retrieve image
  const [selectedImages, setSelectedImages] = useState(null)
  console.log('🚀 ~ ModalWindow ~ selectedImage:', selectedImages)

  //added to retrieve image
  const setImage = (image) => {
    setSelectedImages(image)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          // fetching user profile
          const userProfileResponse = await AxiosMotion.get('/users/me/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          // dispatching action to store user profile
          dispatch(getUserProfileSuccess(userProfileResponse.data))
        } catch (error) {
          console.error(error)
        }
      }
    }
    fetchData()
  }, [token, dispatch])

  // Added handleCreatPost, form and buttom on submit

  const handleCreatePost = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('content', newPostContent.trim())
    selectedImages &&
      selectedImages.forEach((file) => {
        formData.append(`images`, file) // Append each file to the form data
      })
    /* formData.append('images', selectedImage) */

    if (newPostContent.trim() && token) {
      try {
        const response = await AxiosMotion.post('/social/posts/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        dispatch(create_post(response.data))
        console.log(response.data)
        onRequestClose() // Close the modal after successful post creation

        // refetching posts to add the new one on the feed
        const fetchData = async () => {
          if (token) {
            try {
              const response = await AxiosMotion.get('/social/posts/', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              dispatch(get_posts(response.data.results))
            } catch (error) {
              console.error(error)
            }
          }
        }
        fetchData()
      } catch (error) {
        console.error(error)
      } finally {
        setNewPostContent('')
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Create Post Modal"
    >
      <ModalContainer>
        <ModalContainerTop>
          <ModalContainerTopLeft>
            {userProfile && (
              <PostProfileImage
                src={userProfile.avatar || avatar}
                alt={userProfile.first_name}
              />
            )}
            {!userProfile && (
              <PostProfileImage src={avatar} alt="Default Avatar" />
            )}
          </ModalContainerTopLeft>
          <ModalContainerTopRight className="container-top-right">
            <CreatePostForm id="createPostForm" onSubmit={handleCreatePost}>
              <ModalTextInput
                type="text"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
              />
            </CreatePostForm>
          </ModalContainerTopRight>
        </ModalContainerTop>
        <ModalContainerBottom>
          <UploadAndDisplayImage setImage={setImage} />
          <PostButton form="createPostForm" type="submit">
            <img src={buttonpost} alt="Post" />
          </PostButton>
        </ModalContainerBottom>
      </ModalContainer>
    </Modal>
  )
}
