// @flow

import React from 'react';
import { View } from 'react-native';
import styles from './styles';
import {
    DefaultLayout,
    CtButton,
    SelectField,
} from '../../../../components';
import { Field, change } from 'redux-form';
import Lng from '../../../../api/lang/i18n';
import { EDIT_LANGUAGE_AND_CURRENCY } from '../../constants';
import { goBack, MOUNT, UNMOUNT } from '../../../../navigation/actions';
import { SymbolStyle } from '../../../../components/CurrencyFormat/styles';
import { headerTitle } from '../../../../api/helper';

type IProps = {
    navigation: Object,
    language: String,
    handleSubmit: Function,
    handleSubmit: Function,
    formValues: Object,
    languages: Object,
    timezones: Object,
    dateFormats: Object,
    currencies: Object,
    getPreferencesLoading: Boolean,
    getSettingItemLoading: Boolean
}


export class LanguageAndCurrency extends React.Component<IProps> {
    constructor(props) {
        super(props);

        this.state = {
            currencyList: [],
            languagesList: [],
        }
    }

    componentWillMount() {
        const {
            getPreferences,
        } = this.props

        getPreferences({
            onResult: (val) => {
                const { currencies, languages } = val
                this.setState({
                    currencyList: this.getCurrenciesList(currencies),
                    languagesList: this.getLanguagesList(languages),
                })
            }
        })
    }

    componentDidMount() {
        const { navigation } = this.props
        goBack(MOUNT, navigation)
    }

    componentWillUnmount() {
        goBack(UNMOUNT)
    }

    setFormField = (field, value) => {
        this.props.dispatch(change(EDIT_LANGUAGE_AND_CURRENCY, field, value));
    };

    onSubmit = (values) => {
        const {
            navigation,
            editPreferences,
            clearPreferences,
            currencies
        } = this.props

        clearPreferences()
        editPreferences({ params: values, navigation, currencies })

    }

    BOTTOM_ACTION = (handleSubmit) => {
        const { editPreferencesLoading, language } = this.props
        return (
            <View style={styles.submitButton}>
                <CtButton
                    onPress={handleSubmit(this.onSubmit)}
                    btnTitle={Lng.t("button.save", { locale: language })}
                    loading={editPreferencesLoading}
                />
            </View>
        )
    }

    getCurrenciesList = (currencies) => {

        let currencyList = []
        if (typeof currencies !== 'undefined' && currencies.length != 0) {
            currencyList = currencies.map((currency) => {

                const { name, code, symbol } = currency
                return {
                    title: name,
                    subtitle: {
                        title: code,
                    },
                    rightTitle: symbol || '-',
                    fullItem: currency
                }
            })
        }
        return currencyList
    }

    getLanguagesList = (languages) => {
        let languageList = []
        if (typeof languages !== 'undefined' && languages) {
            languageList = languages.map((language) => {

                let { name } = language
                return {
                    title: name,
                    leftAvatar: name.toUpperCase().charAt(0),
                    fullItem: language
                }
            })
        }
        return languageList
    }

    getSelectedField = (items, find, field) => {
        let newData = []
        if (typeof items !== 'undefined') {

            newData = items.filter((item) => {
                let filterData = false
                let itemField = item.fullItem ?
                    item.fullItem[field].toString() : item[field].toString()

                if (itemField === find)
                    filterData = true

                return filterData
            });

        }

        if (newData.length !== 0) {
            let { name } = newData[0].fullItem
            return name
        }
        return '  '
    }

    render() {

        const {
            navigation,
            handleSubmit,
            language,
            formValues: {
                currency,
            },
            formValues,
            isLoading
        } = this.props;

        const { currencyList, languagesList } = this.state

        return (
            <DefaultLayout
                headerProps={{
                    leftIconPress: () => navigation.goBack(null),
                    title: Lng.t("header.setting.LanguageAndCurrency", { locale: language }),
                    placement: "center",
                    rightIcon: "save",
                    rightIconProps: {
                        solid: true,
                    },
                    rightIconPress: handleSubmit(this.onSubmit),
                    titleStyle: styles.titleStyle
                }}
                bottomAction={this.BOTTOM_ACTION(handleSubmit)}
                loadingProps={{
                    is: isLoading || currencyList.length === 0 || languagesList.length === 0
                }}
            >

                <View style={styles.mainContainer}>

                    <Field
                        name="language"
                        items={languagesList}
                        component={SelectField}
                        label={Lng.t("settings.preferences.language", { locale: language })}
                        icon='language'
                        rightIcon='angle-right'
                        displayName="name"
                        placeholder={formValues.language ?
                            this.getSelectedField(languagesList, formValues.language, 'code') :
                            Lng.t("settings.preferences.languagePlaceholder", { locale: language })
                        }
                        navigation={navigation}
                        fakeInputProps={{
                            valueStyle: styles.selectedField,
                            placeholderStyle: styles.selectedField,
                        }}
                        searchFields={['name']}
                        compareField="code"
                        onSelect={(val) => {
                            this.setFormField('language', val.code)
                        }}
                        headerProps={{
                            title: Lng.t("languages.title", { locale: language }),
                            rightIconPress: null
                        }}
                        listViewProps={{
                            hasAvatar: true,
                        }}
                        emptyContentProps={{
                            contentType: "languages",
                        }}
                        isRequired
                    />

                    <Field
                        name="currency"
                        items={currencyList}
                        displayName="name"
                        component={SelectField}
                        label={Lng.t("settings.preferences.currency", { locale: language })}
                        icon='dollar-sign'
                        rightIcon='angle-right'
                        placeholder={currency ?
                            this.getSelectedField(currencyList, currency, 'id') :
                            Lng.t("settings.preferences.currencyPlaceholder", { locale: language })
                        }
                        navigation={navigation}
                        searchFields={['name']}
                        compareField="id"
                        fakeInputProps={{
                            valueStyle: styles.selectedField,
                            placeholderStyle: styles.selectedField,
                        }}
                        searchInputProps={{
                            autoFocus: true
                        }}
                        onSelect={(val) => {
                            this.setFormField('currency', val.id)
                        }}
                        headerProps={{
                            title: Lng.t("currencies.title", { locale: language }),
                            titleStyle: headerTitle({ marginLeft: -20, marginRight: -52 }),
                            rightIconPress: null
                        }}
                        emptyContentProps={{
                            contentType: "currencies",
                        }}
                        isRequired
                        listViewProps={{
                            contentContainerStyle: { flex: 5 },
                            rightTitleStyle: SymbolStyle
                        }}
                    />

                </View>
            </DefaultLayout>
        );
    }
}
