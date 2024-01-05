import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ResultItem } from '../../type';
import { useNavigate } from 'react-router-dom';
import {
    RightOutlined,
    DownOutlined,
    FilePdfOutlined,
    LoadingOutlined,
    FileSearchOutlined,
    FileAddOutlined,
} from '@ant-design/icons';
import { highlightSearchTerms } from '../../utils/highlighSearchTerms';
import { BigIcon, NullText, PDFLink } from '../shared/design-system.styled';
import { getAllFilenames } from '../../API/repository/file-repository';

type Props = {
    query: string;
    searchResult: ResultItem[] | null;
    loading: boolean;
};

const snippetLimit = 1000;

const SearchResultDisplay = ({ query, searchResult, loading }: Props) => {
    const navigate = useNavigate();

    const [expanded, setExpanded] = useState<string[]>([]);
    const [showMore, setShowMore] = useState<string[]>([]);
    const [filenames, setFilenames] = useState<string[]>([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const files = await getAllFilenames();
            setFilenames(files);
        };
        fetchFiles();
    }, []);

    useEffect(() => {
        setExpanded([]);
        setShowMore([]);
    }, [query]);

    const expand = (key: string) => {
        if (expanded.includes(key)) {
            setExpanded(expanded.filter((item) => item !== key));
        } else {
            setExpanded([...expanded, key]);
        }
    };

    const toggleShowMore = (key: string) => {
        setShowMore((prevShowMore) =>
            prevShowMore.includes(key)
                ? prevShowMore.filter((k) => k !== key)
                : [...prevShowMore, key],
        );
    };

    console.log(filenames);

    return (
        <Container>
            {filenames.length === 0 && (
                <UploadRedirection onClick={() => navigate('/files')}>
                    <NullText>
                        <BigIcon>
                            <FileAddOutlined />
                        </BigIcon>
                        <p>Please upload some files before starting ...</p>
                    </NullText>
                </UploadRedirection>
            )}
            {filenames.length > 0 && !loading && !searchResult && (
                <NullText>
                    <BigIcon>
                        <FileSearchOutlined />
                    </BigIcon>
                    <p>Query something ...</p>
                </NullText>
            )}
            {loading && (
                <NullText>
                    <BigIcon>
                        <LoadingOutlined />
                    </BigIcon>
                    <p>Scanning documents ...</p>
                </NullText>
            )}
            {!loading &&
                searchResult &&
                searchResult.map((result: ResultItem, index: number) => {
                    if (result.snippet === 'Snippet not found.') {
                        return (
                            <ResultContainer key={result.document}>
                                <ResultTitle>
                                    {`Result - ${index + 1}`}
                                    <DistanceSpan>{`dist ${result.distance}`}</DistanceSpan>
                                </ResultTitle>
                                {/* <SnippetContainer>
                                    {'Related content found'}
                                </SnippetContainer> */}
                                <SourceActionContainer
                                    onClick={() => expand(result.document)}
                                >
                                    <ArrowIcon>
                                        {!expanded.includes(result.document) ? (
                                            <DownOutlined />
                                        ) : (
                                            <RightOutlined />
                                        )}
                                    </ArrowIcon>
                                    {`Source`}
                                    <HorizontalLine />
                                </SourceActionContainer>
                                {!expanded.includes(result.document) ? (
                                    <SourceContainer
                                        href={`http://localhost:8000/get-pdf/${result.document}`}
                                        target="_blank"
                                    >
                                        <BigIcon>
                                            <FilePdfOutlined />
                                        </BigIcon>

                                        <PDFLink>{result.document}</PDFLink>
                                    </SourceContainer>
                                ) : null}
                            </ResultContainer>
                        );
                    }

                    const showFullSnippet = showMore.includes(result.document);
                    const snippetToShow = showFullSnippet
                        ? result.snippet
                        : result.snippet.substring(0, snippetLimit);
                    const remainingCharacters =
                        result.snippet.length - snippetLimit;

                    return (
                        <ResultContainer key={result.document}>
                            <ResultTitle>
                                {`Result - ${index + 1}`}
                                <DistanceSpan>{`dist ${result.distance}`}</DistanceSpan>
                            </ResultTitle>
                            <SnippetContainer>
                                {highlightSearchTerms(
                                    snippetToShow,
                                    query.trim(),
                                )}
                                {!showFullSnippet &&
                                    result.snippet.length > snippetLimit &&
                                    ' ... '}
                                {result.snippet.length > snippetLimit && (
                                    <ShowMoreButton
                                        onClick={() =>
                                            toggleShowMore(result.document)
                                        }
                                    >
                                        {showFullSnippet
                                            ? 'Show less'
                                            : `Show ${remainingCharacters} more characters`}
                                    </ShowMoreButton>
                                )}
                            </SnippetContainer>
                            <SourceActionContainer
                                onClick={() => expand(result.document)}
                            >
                                <ArrowIcon>
                                    {expanded.includes(result.document) ? (
                                        <DownOutlined />
                                    ) : (
                                        <RightOutlined />
                                    )}
                                </ArrowIcon>
                                {`Source - ${result.occurrences} occurrence${
                                    result.occurrences > 1 ? 's' : ''
                                } in total`}
                                <HorizontalLine />
                            </SourceActionContainer>
                            {expanded.includes(result.document) ? (
                                <SourceContainer
                                    href={`http://localhost:8000/get-pdf/${result.document}`}
                                    target="_blank"
                                >
                                    <BigIcon>
                                        <FilePdfOutlined />
                                    </BigIcon>

                                    <PDFLink>{result.document}</PDFLink>
                                </SourceContainer>
                            ) : null}
                        </ResultContainer>
                    );
                })}
            {/* {!loading &&
            searchResult &&
            searchResult.filter(
                (result: ResultItem) => result.snippet !== 'Snippet not found.',
            ).length === 0 ? (
                <NullText>
                    <BigIcon>
                        <FileUnknownOutlined />
                    </BigIcon>
                    <p>No results found</p>
                </NullText>
            ) : null} */}
        </Container>
    );
};

export default SearchResultDisplay;

const UploadRedirection = styled.div`
    cursor: pointer;
    &:hover {
        color: ${(props) => props.theme.accentColor};
    }
`;

const ShowMoreButton = styled.button`
    color: ${(props) => props.theme.primaryColor};
    background: none;
    border: none;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`;

const SnippetContainer = styled.div`
    position: relative;
`;

const DistanceSpan = styled.span`
    color: ${(props) => props.theme.accentColor};
    font-size: 12px;
    margin-left: 10px;
    font-weight: 400;
`;

const SourceContainer = styled.a`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 40px;
    text-decoration: none;
`;

const ArrowIcon = styled.div``;

const SourceActionContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    color: ${(props) => props.theme.accentColor};
    font-size: 15px;
    margin-top: 20px;
`;

const HorizontalLine = styled.div`
    background-color: ${(props) => props.theme.accentColor};
    height: 1px;
    flex-grow: 1;
`;

const ResultTitle = styled.h3`
    color: ${(props) => props.theme.textColor};
    display: flex;
    justify-content: space-between;
`;

const ResultContainer = styled.div`
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    padding: 20px;
    margin: 30px 0;
    background-color: ${(props) => props.theme.backgroundColor};
    border-radius: 5px;
`;

const Container = styled.div`
    padding-bottom: 100px;
`;
