import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useForm } from '../util/hooks';
import { Form, Button, Image } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';

const SETTING_FORM = {
    username: '',
    oldPassword: '',
    password: '',
    confirmPassword: '',
    image: "",
    imageURL: ""

}
const Settings = () => {
    const [errors, setErrors] = useState({});
    const uploadRef = useRef()
    const { onChange, onChangeImage, onSubmit, reset, values } = useForm(submitForm, SETTING_FORM);

    function submitForm() {
        console.log(values)
        updateProfile()
    }

    const [updateProfile, { loading }] = useMutation(UPDATE_SETTINGS, {
        update() {
            reset();
        },
        variables: {
            username: values.username,
            password: values.oldPassword,
            newPassword: values.password
        }, onError(err) {
            setErrors(err.graphQLErrors[0].extensions.exception.errors);
        },
    });


    const [uploadFile, { loadingImage }] = useMutation(UPLOAD_PROFILE_IMAGE, {
        update() {
            reset();
        },
        onError(err) {
            console.log(err.graphQLErrors[0].extensions.exception.errors)
            // setErrors(err.graphQLErrors[0].extensions.exception.errors);
        },
    });



    return (
        <div className="form-container">
            <Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
                <h1>Update Profile</h1>
                <Form.Input
                    label="Username"
                    placeholder="Username.."
                    name="username"
                    type="text"
                    value={values.username}
                    error={errors.username ? true : false}
                    onChange={onChange}
                />
                <Form.Input
                    label="Old Password"
                    placeholder="Password.."
                    name="oldPassword"
                    type="password"
                    value={values.oldPassword}
                    error={errors.password ? true : false}
                    onChange={onChange}
                />
                <Form.Input
                    label="Password"
                    placeholder="Password.."
                    name="password"
                    type="password"
                    value={values.password}
                    error={errors.password ? true : false}
                    onChange={onChange}
                />
                <Form.Input
                    label="Confirm Password"
                    placeholder="Confirm Password.."
                    name="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    error={errors.confirmPassword ? true : false}
                    onChange={onChange}
                />
                <div style={{ marginBottom: 5 }}>
                    <Image src={values.imageURL || 'https://react.semantic-ui.com/images/wireframe/image.png'} size='small' wrapped />
                    <input type="file"
                        id="imageURL"
                        name="image"
                        ref={uploadRef}
                        accept="image/*"
                        multiple={false}
                        onChange={(e) => onChangeImage(e, uploadFile)}
                    />
                </div>

                <Button type="submit" primary>
                    Submit
          </Button>
            </Form>
            {Object.keys(errors).length > 0 && (
                <div className="ui error message">
                    <ul className="list">
                        {Object.values(errors).map((value) => (
                            <li key={value}>{value}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

Settings.propTypes = {};

export default Settings;


const UPDATE_SETTINGS = gql`
  mutation($username: String!, $password: String!, $newPassword: String!),  {
    updateProfile(username:$username, password:$password, newPassword:$newPassword){
    id
    email
    username
    image
    createdAt
    }
  }
`;

const UPLOAD_PROFILE_IMAGE = gql`
  mutation($file:Upload!),  {
uploadFile(file:$file) {
    url,
    userId,
    filename,
    mimetype,
    encoding
}
  }
`;



